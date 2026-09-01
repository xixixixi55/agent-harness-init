import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { parse } from 'yaml'
import type { ChangeStatus, GateStage, WorkflowFinding, WorkflowLevel } from './types.js'

const deltaHeader = /^##\s+(ADDED|MODIFIED|REMOVED|RENAMED)\s+Requirements\s*$/gim
const requiredSkills = ['propose', 'apply', 'fix', 'continue', 'status', 'verify', 'semantic-review', 'code-review', 'archive'].map((name) => `harness-${name}`)

function validSkill(name: string, content: string | undefined): boolean {
  if (!content) return false
  const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  if (!frontmatter) return false
  try {
    const metadata = parse(frontmatter[1]) as { name?: unknown }
    const links = [...content.slice(frontmatter[0].length).matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map((match) => match[1])
    return metadata?.name === name && links.includes(`../../../harness/workflow-protocols.md#${name}`)
  } catch {
    return false
  }
}

function readText(file: string): string {
  return existsSync(file) ? readFileSync(file, 'utf8') : ''
}

function taskState(text: string): { completed: number; total: number; incomplete: string[] } {
  const tasks = text.split(/\r?\n/).filter((line) => /^\s*- \[[ xX]\]/.test(line))
  const incomplete = tasks.filter((line) => /^\s*- \[ \]/.test(line) && !/\[(OPTIONAL|DEFERRED|N\/A)\]\s*$/i.test(line))
  return { completed: tasks.filter((line) => /^\s*- \[[xX]\]/.test(line)).length, total: tasks.length, incomplete }
}

function levelFromTasks(text: string): WorkflowLevel | undefined {
  const value = Number(text.match(/^workflow_level:\s*([123])\s*$/m)?.[1])
  return value === 1 || value === 2 || value === 3 ? value : undefined
}

function deltaFiles(changeRoot: string): string[] {
  const root = path.join(changeRoot, 'specs')
  if (!existsSync(root)) return []
  const files: string[] = []
  const visit = (directory: string): void => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const target = path.join(directory, entry.name)
      if (entry.isDirectory()) visit(target)
      if (entry.isFile() && entry.name === 'spec.md') files.push(target)
    }
  }
  visit(root)
  return files
}

function ok(code: string, message: string): WorkflowFinding {
  return { code, status: 'ok', message }
}

function error(code: string, message: string): WorkflowFinding {
  return { code, status: 'error', message }
}

function deltaProblems(text: string): string[] {
  const sections = [...text.matchAll(deltaHeader)]
  if (sections.length === 0) return ['missing delta section']
  const problems: string[] = []
  for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex += 1) {
    const section = sections[sectionIndex]
    const type = section[1].toUpperCase()
    const start = (section.index ?? 0) + section[0].length
    const end = sections[sectionIndex + 1]?.index ?? text.length
    const body = text.slice(start, end)
    if (type === 'RENAMED') {
      if (!/^\s*-?\s*(?:\*\*)?FROM(?:\*\*)?:\s*.+$/im.test(body) || !/^\s*-?\s*(?:\*\*)?TO(?:\*\*)?:\s*.+$/im.test(body)) {
        problems.push('RENAMED section requires FROM and TO')
      }
      continue
    }
    const requirements = [...body.matchAll(/^###\s+Requirement:\s*.+$/gim)]
    if (requirements.length === 0) {
      problems.push(`${type} section has no Requirement`)
      continue
    }
    for (let requirementIndex = 0; requirementIndex < requirements.length; requirementIndex += 1) {
      const current = requirements[requirementIndex]
      const requirementBody = body.slice(
        (current.index ?? 0) + current[0].length,
        requirements[requirementIndex + 1]?.index ?? body.length,
      )
      if (type === 'REMOVED') {
        if (!/^\s*(?:\*\*)?Reason(?:\*\*)?:\s*.+$/im.test(requirementBody)
          || !/^\s*(?:\*\*)?Migration(?:\*\*)?:\s*.+$/im.test(requirementBody)) {
          problems.push(`${current[0]} requires Reason and Migration`)
        }
        continue
      }
      const scenarios = [...requirementBody.matchAll(/^####\s+Scenario:\s*.+$/gim)]
      const completeScenario = scenarios.some((scenarioMatch, scenarioIndex) => {
        const scenarioBody = requirementBody.slice(
          (scenarioMatch.index ?? 0) + scenarioMatch[0].length,
          scenarios[scenarioIndex + 1]?.index ?? requirementBody.length,
        )
        return /\bWHEN\b/i.test(scenarioBody) && /\bTHEN\b/i.test(scenarioBody)
      })
      if (!completeScenario) problems.push(`${current[0]} requires a Scenario with WHEN and THEN`)
    }
  }
  return problems
}

function declaration(text: string, key: string): { value?: string; valid: boolean } {
  const values = [...text.matchAll(new RegExp(`^${key}:\\s*(.+?)\\s*$`, 'gim'))].map((match) => match[1].toLowerCase())
  return { value: values[0], valid: values.length === 1 }
}

function reviewProblems(text: string, level: 2 | 3): string[] {
  const problems: string[] = []
  for (const [key, expected] of [['engineering_verification', 'passed'], ['semantic_review', 'passed'], ['spec_sync', 'complete']] as const) {
    const field = declaration(text, key)
    if (!field.valid || field.value !== expected) problems.push(`${key}: ${expected}`)
  }
  const independent = declaration(text, 'independent_review')
  if (level === 3) {
    if (!independent.valid || independent.value !== 'passed') problems.push('independent_review: passed')
  } else if (!independent.valid || !['passed', 'not_applicable'].includes(independent.value ?? '')) {
    problems.push('independent_review: passed|not_applicable')
  } else if (independent.value === 'not_applicable') {
    const reason = declaration(text, 'independent_review_reason')
    const placeholders = ['pending', 'todo', 'n/a', 'none', 'not_required_when_passed']
    if (!reason.valid || !reason.value || placeholders.includes(reason.value) || /[<>]/.test(reason.value)) problems.push('independent_review_reason: <concrete reason>')
  }
  return problems
}

function iterationProblems(text: string): string[] {
  const required = ['Outcomes', 'Problems', 'Lessons', 'Project Harness Updates', 'Template Candidates']
  const sections = [...text.matchAll(/^##\s+(.+?)\s*$/gim)]
  const problems: string[] = []
  const requiredSections = required.map((heading) => sections.filter((section) => section[1].toLowerCase() === heading.toLowerCase()))
  for (let index = 0; index < required.length; index += 1) {
    const matches = requiredSections[index]
    if (matches.length !== 1) {
      problems.push(matches.length === 0 ? required[index] : `${required[index]} duplicated`)
      continue
    }
    const match = matches[0]
    const sectionIndex = sections.indexOf(match)
    const bodyStart = (match.index ?? 0) + match[0].length
    const bodyEnd = sections[sectionIndex + 1]?.index ?? text.length
    const body = text.slice(bodyStart, bodyEnd)
      .replace(/<!--[\s\S]*?-->/g, '').trim()
    if (body.length === 0) problems.push(required[index])
  }
  const positions = requiredSections.map((matches) => matches[0]?.index ?? -1)
  if (positions.every((position) => position >= 0) && positions.some((position, index) => index > 0 && position <= positions[index - 1])) problems.push('section order')
  return [...new Set(problems)]
}

function filesUnder(directory: string, predicate: (file: string) => boolean): string[] {
  if (!existsSync(directory)) return []
  const files: string[] = []
  const visit = (current: string): void => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const target = path.join(current, entry.name)
      if (entry.isDirectory()) visit(target)
      if (entry.isFile() && predicate(target)) files.push(target)
    }
  }
  visit(directory)
  return files
}

export function evaluateRepositoryEntropy(root: string): WorkflowFinding[] {
  const findings: WorkflowFinding[] = []
  const summary = readText(path.join(root, 'AGENT_HARNESS.md'))
  for (const reference of ['harness/project-architecture.md', 'harness/repository-assets.md']) {
    const present = existsSync(path.join(root, reference))
    findings.push(present && summary.includes(reference) ? ok(`summary-${path.basename(reference)}`, `AGENT_HARNESS.md references existing ${reference}.`) : error(`summary-${path.basename(reference)}-missing`, `AGENT_HARNESS.md must reference existing ${reference}.`))
  }

  const markdown = [path.join(root, 'README.md'), path.join(root, 'AGENT_HARNESS.md'),
    ...['harness', '.agents/skills', '.claude/skills', 'openspec'].flatMap((directory) => filesUnder(path.join(root, directory), (file) => file.endsWith('.md')))]
  const broken: string[] = []
  for (const file of markdown.filter(existsSync)) {
    const links = [...readText(file).matchAll(/\[[^\]]+\]\((?!https?:|mailto:|#|\/)([^)#]+)(?:#[^)]+)?\)/g)]
    for (const match of links) {
      const target = path.resolve(path.dirname(file), match[1])
      if (!existsSync(target)) broken.push(`${path.relative(root, file)} -> ${match[1]}`)
    }
  }
  findings.push(broken.length === 0 ? ok('relative-links', 'Harness relative links resolve.') : error('relative-links-broken', `Broken relative link(s): ${broken.join(', ')}`))

  const skillMap = (provider: '.agents' | '.claude'): Map<string, string> => new Map(
    filesUnder(path.join(root, provider, 'skills'), (file) => file.endsWith('SKILL.md') && path.basename(path.dirname(file)).startsWith('harness-'))
      .map((file) => [path.basename(path.dirname(file)), readText(file).replaceAll('\r\n', '\n')]),
  )
  const agents = skillMap('.agents')
  const claude = skillMap('.claude')
  let providers: string[] = []
  try {
    const config = parse(readText(path.join(root, 'harness.config.yaml'))) as { agents?: unknown }
    providers = Array.isArray(config?.agents) ? config.agents.filter((value): value is string => typeof value === 'string') : []
  } catch {
    providers = []
  }
  const validProviders = providers.length > 0 && providers.every((provider) => provider === 'codex' || provider === 'claude')
    && new Set(providers).size === providers.length
  if (!validProviders) findings.push(error('provider-config-invalid', 'harness.config.yaml must declare unique codex and/or claude providers.'))
  else if (providers.includes('codex') && providers.includes('claude')) {
    const drift = requiredSkills.filter((name) => !validSkill(name, agents.get(name)) || !validSkill(name, claude.get(name)) || agents.get(name) !== claude.get(name))
    findings.push(drift.length === 0 ? ok('provider-mirror', 'All required Codex and Claude Harness Skills are present and mirrored.') : error('provider-mirror-drift', `Provider Skill drift or absence: ${drift.join(', ')}`))
  } else {
    const enabled = providers.includes('codex') ? agents : claude
    const missing = requiredSkills.filter((name) => !validSkill(name, enabled.get(name)))
    findings.push(missing.length === 0 ? ok('provider-single', `All required ${providers[0]} Harness Skills are present.`) : error('provider-skills-missing', `Enabled ${providers[0]} Harness Skills are missing: ${missing.join(', ')}`))
  }
  return findings
}

export function discoverChangeStatuses(root: string): ChangeStatus[] {
  const changesRoot = path.join(root, 'openspec', 'changes')
  if (!existsSync(changesRoot)) return []
  return readdirSync(changesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== 'archive')
    .map((entry) => {
      const tasks = readText(path.join(changesRoot, entry.name, 'tasks.md'))
      const state = taskState(tasks)
      return { name: entry.name, level: levelFromTasks(tasks), completedTasks: state.completed, totalTasks: state.total }
    })
    .sort((left, right) => left.name.localeCompare(right.name))
}

export function evaluateWorkflowGate(root: string, level: WorkflowLevel, stage: GateStage, change?: string): WorkflowFinding[] {
  if (level === 1) return stage === 'archive'
    ? [error('level-1-no-archive', 'Level 1 has no archive stage.')]
    : [ok('level-1', 'Level 1 requires no change package; use risk-proportionate project verification.')]
  if (!change) return [error('change-required', `Level ${level} ${stage} gate requires --change NAME.`)]
  if (!/^[a-z0-9][a-z0-9-]*$/.test(change)) return [error('change-name-invalid', 'Change names must use lowercase kebab-case without path separators.')]

  const changeRoot = path.join(root, 'openspec', 'changes', change)
  if (!existsSync(changeRoot)) return [error('change-missing', `Active change is missing: ${change}`)]
  const findings: WorkflowFinding[] = []
  const tasksText = readText(path.join(changeRoot, 'tasks.md'))
  if (!tasksText) findings.push(error('tasks-missing', 'tasks.md is required.'))
  else if (levelFromTasks(tasksText) !== level) findings.push(error('level-mismatch', `tasks.md must declare workflow_level: ${level}.`))
  else if (taskState(tasksText).total === 0) findings.push(error('tasks-empty', 'tasks.md must contain at least one checklist task.'))
  else findings.push(ok('tasks-level', `tasks.md declares workflow_level: ${level} and contains checklist tasks.`))

  if (level === 3) {
    for (const file of ['proposal.md', 'design.md']) {
      findings.push(existsSync(path.join(changeRoot, file)) ? ok(`${file}-present`, `${file} is present.`) : error(`${file}-missing`, `${file} is required for Level 3.`))
    }
  }

  const deltas = deltaFiles(changeRoot)
  if (deltas.length === 0) findings.push(error('delta-missing', 'At least one specs/<capability>/spec.md delta is required.'))
  else {
    const invalid = deltas.flatMap((file) => deltaProblems(readText(file)).map((problem) => `${path.relative(root, file)} (${problem})`))
    findings.push(invalid.length === 0 ? ok('delta-valid', `${deltas.length} delta spec(s) have the required structure.`) : error('delta-invalid', `Invalid delta spec(s): ${invalid.join(', ')}`))
  }

  if (stage === 'archive') {
    const state = taskState(tasksText)
    if (state.total === 0) findings.push(error('tasks-empty', 'Archive requires at least one checklist task.'))
    else if (state.incomplete.length > 0) findings.push(error('tasks-incomplete', `${state.incomplete.length} required task(s) remain incomplete.`))
    else findings.push(ok('tasks-complete', 'All required tasks are complete.'))
    const review = readText(path.join(changeRoot, 'review.md'))
    const reviewIssues = reviewProblems(review, level)
    findings.push(reviewIssues.length === 0 ? ok('review-evidence', 'Archive review and sync declarations are valid.') : error('review-evidence-missing', `review.md has missing or invalid declarations: ${reviewIssues.join(', ')}`))
    const unsynced = deltas.filter((file) => !existsSync(path.join(root, 'openspec', 'specs', path.relative(path.join(changeRoot, 'specs'), file))))
    findings.push(unsynced.length === 0 ? ok('living-spec-sync', 'Each delta capability has a living spec target.') : error('living-spec-sync-missing', `Missing living spec(s): ${unsynced.map((file) => path.relative(path.join(changeRoot, 'specs'), file)).join(', ')}`))
    if (level === 3) {
      const iterationIssues = iterationProblems(readText(path.join(changeRoot, 'iteration.md')))
      findings.push(iterationIssues.length === 0 ? ok('iteration-record', 'Level 3 iteration record is complete.') : error('iteration-record-missing', `iteration.md has missing or empty sections: ${iterationIssues.join(', ')}`))
    }
    findings.push(ok('semantic-boundary', 'Structural readiness does not prove semantic correctness; Agent review remains authoritative.'))
  }
  if (stage !== 'plan') findings.push(...evaluateRepositoryEntropy(root))
  return findings
}
