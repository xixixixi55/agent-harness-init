import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { discoverChangeStatuses, evaluateRepositoryEntropy, evaluateWorkflowGate } from './workflow.js'

const roots: string[] = []

function fixture(name = 'change'): { root: string; changeRoot: string } {
  const root = mkdtempSync(path.join(tmpdir(), 'agent-harness-workflow-SYNTHETIC-'))
  roots.push(root)
  const changeRoot = path.join(root, 'openspec', 'changes', name)
  mkdirSync(path.join(changeRoot, 'specs', 'capability'), { recursive: true })
  return { root, changeRoot }
}

function delta(): string {
  return '## ADDED Requirements\n\n### Requirement: Synthetic behavior\n\n#### Scenario: Synthetic path\n- **WHEN** input is synthetic\n- **THEN** output is synthetic\n'
}

function writeEntropyFixture(root: string, providers = ['codex', 'claude']): void {
  mkdirSync(path.join(root, 'harness'), { recursive: true })
  writeFileSync(path.join(root, 'harness.config.yaml'), `agents:\n${providers.map((provider) => `  - ${provider}`).join('\n')}\n`)
  writeFileSync(path.join(root, 'harness', 'project-architecture.md'), '# SYNTHETIC architecture\n')
  writeFileSync(path.join(root, 'harness', 'repository-assets.md'), '# SYNTHETIC assets\n')
  writeFileSync(path.join(root, 'harness', 'workflow-protocols.md'), '# SYNTHETIC protocols\n')
  writeFileSync(path.join(root, 'AGENT_HARNESS.md'), 'See harness/project-architecture.md and harness/repository-assets.md.\n')
  for (const provider of providers) {
    const directory = provider === 'codex' ? '.agents' : '.claude'
    for (const name of ['propose', 'apply', 'fix', 'continue', 'status', 'verify', 'semantic-review', 'code-review', 'archive']) {
      mkdirSync(path.join(root, directory, 'skills', `harness-${name}`), { recursive: true })
      writeFileSync(path.join(root, directory, 'skills', `harness-${name}`, 'SKILL.md'), `---\nname: harness-${name}\n---\n[protocol](../../../harness/workflow-protocols.md#harness-${name})\n`)
    }
  }
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

describe('workflow gates', () => {
  it('keeps Level 1 free of change-package requirements', () => {
    expect(evaluateWorkflowGate('SYNTHETIC-root', 1, 'verify')).toEqual([
      expect.objectContaining({ code: 'level-1', status: 'ok' }),
    ])
    expect(evaluateWorkflowGate('SYNTHETIC-root', 1, 'archive')).toEqual([
      expect.objectContaining({ code: 'level-1-no-archive', status: 'error' }),
    ])
  })

  it('requires the compact Level 2 package', () => {
    const { root, changeRoot } = fixture()
    writeFileSync(path.join(changeRoot, 'tasks.md'), '# Tasks\n\nworkflow_level: 2\n\n- [ ] T001 Synthetic task\n')
    writeFileSync(path.join(changeRoot, 'specs', 'capability', 'spec.md'), delta())
    expect(evaluateWorkflowGate(root, 2, 'plan', 'change').every((finding) => finding.status === 'ok')).toBe(true)
    expect(discoverChangeStatuses(root)).toEqual([{ name: 'change', level: 2, completedTasks: 0, totalTasks: 1 }])
  })

  it('rejects change names that could escape the active changes directory', () => {
    expect(evaluateWorkflowGate('SYNTHETIC-root', 2, 'plan', '../outside')).toEqual([
      expect.objectContaining({ code: 'change-name-invalid', status: 'error' }),
    ])
  })

  it('rejects an empty task list and a Requirement without its own complete Scenario', () => {
    const { root, changeRoot } = fixture()
    writeFileSync(path.join(changeRoot, 'tasks.md'), '# Tasks\n\nworkflow_level: 2\n')
    writeFileSync(path.join(changeRoot, 'specs', 'capability', 'spec.md'), `${delta()}\n### Requirement: Uncovered behavior\n`)
    const findings = evaluateWorkflowGate(root, 2, 'plan', 'change')
    expect(findings).toContainEqual(expect.objectContaining({ code: 'tasks-empty', status: 'error' }))
    expect(findings).toContainEqual(expect.objectContaining({ code: 'delta-invalid', status: 'error' }))
  })

  it('blocks Level 3 archive until tasks and review evidence converge', () => {
    const { root, changeRoot } = fixture()
    writeFileSync(path.join(changeRoot, 'proposal.md'), '# Proposal\n')
    writeFileSync(path.join(changeRoot, 'design.md'), '# Design\n')
    writeFileSync(path.join(changeRoot, 'tasks.md'), '# Tasks\n\nworkflow_level: 3\n\n- [ ] T001 Synthetic task\n')
    writeFileSync(path.join(changeRoot, 'specs', 'capability', 'spec.md'), delta())
    const blocked = evaluateWorkflowGate(root, 3, 'archive', 'change')
    expect(blocked).toContainEqual(expect.objectContaining({ code: 'tasks-incomplete', status: 'error' }))
    expect(blocked).toContainEqual(expect.objectContaining({ code: 'review-evidence-missing', status: 'error' }))

    writeFileSync(path.join(changeRoot, 'review.md'), 'engineering_verification: passed\nsemantic_review: passed\nsemantic_review: failed\nindependent_review:\nspec_sync: complete\n')
    expect(evaluateWorkflowGate(root, 3, 'archive', 'change')).toContainEqual(
      expect.objectContaining({ code: 'review-evidence-missing', status: 'error' }),
    )

    writeFileSync(path.join(changeRoot, 'iteration.md'), '# Iteration\n\n## Outcomes\nSYNTHETIC\n\n## Problems\n\n## Extra\nText that must not count as Problems.\n\n## Lessons\nSYNTHETIC\n\n## Project Harness Updates\nNone.\n\n## Template Candidates\nNone.\n')
    expect(evaluateWorkflowGate(root, 3, 'archive', 'change')).toContainEqual(
      expect.objectContaining({ code: 'iteration-record-missing', status: 'error' }),
    )

    writeFileSync(path.join(changeRoot, 'tasks.md'), '# Tasks\n\nworkflow_level: 3\n\n- [x] T001 Synthetic task\n')
    writeFileSync(path.join(changeRoot, 'review.md'), 'engineering_verification: passed\nsemantic_review: passed\nindependent_review: passed\nspec_sync: complete\n')
    writeFileSync(path.join(changeRoot, 'iteration.md'), '# Iteration\n\n## Outcomes\nSYNTHETIC outcome\n\n## Problems\nNone.\n\n## Lessons\nSYNTHETIC lesson.\n\n## Project Harness Updates\nNone.\n\n## Template Candidates\nNone.\n')
    mkdirSync(path.join(root, 'openspec', 'specs', 'capability'), { recursive: true })
    writeFileSync(path.join(root, 'openspec', 'specs', 'capability', 'spec.md'), '# SYNTHETIC living spec\n')
    writeEntropyFixture(root)
    expect(evaluateWorkflowGate(root, 3, 'archive', 'change').every((finding) => finding.status === 'ok')).toBe(true)
  })

  it('rejects the Level 2 independent-review reason placeholder', () => {
    const { root, changeRoot } = fixture()
    writeFileSync(path.join(changeRoot, 'tasks.md'), '# Tasks\n\nworkflow_level: 2\n\n- [x] T001 Synthetic task\n')
    writeFileSync(path.join(changeRoot, 'specs', 'capability', 'spec.md'), delta())
    writeFileSync(path.join(changeRoot, 'review.md'), 'engineering_verification: passed\nsemantic_review: passed\nindependent_review: not_applicable\nindependent_review_reason: not_required_when_passed\nspec_sync: complete\n')
    mkdirSync(path.join(root, 'openspec', 'specs', 'capability'), { recursive: true })
    writeFileSync(path.join(root, 'openspec', 'specs', 'capability', 'spec.md'), '# SYNTHETIC\n')
    writeEntropyFixture(root, ['codex'])
    expect(evaluateWorkflowGate(root, 2, 'archive', 'change')).toContainEqual(
      expect.objectContaining({ code: 'review-evidence-missing', status: 'error' }),
    )
  })

  it('accepts a configured single provider without requiring a mirror', () => {
    const { root } = fixture()
    writeEntropyFixture(root, ['codex'])
    expect(evaluateRepositoryEntropy(root)).toContainEqual(expect.objectContaining({ code: 'provider-single', status: 'ok' }))
  })

  it('fails a single-provider install when one required Skill is absent', () => {
    const { root } = fixture()
    writeEntropyFixture(root, ['codex'])
    rmSync(path.join(root, '.agents', 'skills', 'harness-archive', 'SKILL.md'))
    expect(evaluateRepositoryEntropy(root)).toContainEqual(expect.objectContaining({ code: 'provider-skills-missing', status: 'error' }))
  })

  it('rejects empty required Skill content', () => {
    const { root } = fixture()
    writeEntropyFixture(root, ['codex'])
    writeFileSync(path.join(root, '.agents', 'skills', 'harness-archive', 'SKILL.md'), '')
    expect(evaluateRepositoryEntropy(root)).toContainEqual(expect.objectContaining({ code: 'provider-skills-missing', status: 'error' }))
  })

  it('rejects Skill-like body text without frontmatter and a Markdown protocol link', () => {
    const { root } = fixture()
    writeEntropyFixture(root, ['codex'])
    writeFileSync(path.join(root, '.agents', 'skills', 'harness-archive', 'SKILL.md'), 'malformed body\nname: harness-archive\nharness/workflow-protocols.md#harness-archive\n')
    expect(evaluateRepositoryEntropy(root)).toContainEqual(expect.objectContaining({ code: 'provider-skills-missing', status: 'error' }))
  })

  it('detects provider mirror drift and missing summary references', () => {
    const { root } = fixture()
    mkdirSync(path.join(root, '.agents', 'skills', 'harness-apply'), { recursive: true })
    mkdirSync(path.join(root, '.claude', 'skills', 'harness-apply'), { recursive: true })
    writeFileSync(path.join(root, '.agents', 'skills', 'harness-apply', 'SKILL.md'), 'SYNTHETIC A\n')
    writeFileSync(path.join(root, '.claude', 'skills', 'harness-apply', 'SKILL.md'), 'SYNTHETIC B\n')
    writeFileSync(path.join(root, 'harness.config.yaml'), 'agents:\n  - codex\n  - claude\n')
    writeFileSync(path.join(root, 'AGENT_HARNESS.md'), 'SYNTHETIC summary\n')
    const findings = evaluateRepositoryEntropy(root)
    expect(findings).toContainEqual(expect.objectContaining({ code: 'provider-mirror-drift', status: 'error' }))
    expect(findings.some((finding) => finding.code.endsWith('-missing'))).toBe(true)
  })
})
