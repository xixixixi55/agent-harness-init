import type { HarnessConfig, ProjectFacts, RenderedArtifact } from './types.js'
import { serializeConfig } from './config.js'

function list(values: string[], fallback: string): string {
  return values.length > 0 ? values.map((value) => `- \`${value}/\``).join('\n') : `- ${fallback}`
}

function commandList(config: HarnessConfig): string {
  const gates = config.verification?.gates ?? []
  if (gates.length > 0) return gates.map(({ name, command }) => `- ${name}: \`${command}\``).join('\n')
  const entries = Object.entries(config.commands).filter((entry): entry is [string, string] => Boolean(entry[1]))
  if (entries.length === 0) return '- No commands detected. Configure `harness.config.yaml` before verification.'
  return entries.map(([name, command]) => `- ${name}: \`${command}\``).join('\n')
}

function agentHarness(config: HarnessConfig): string {
  return `# Agent Harness — ${config.project.name}

This file is managed by Agent Harness Init. Project-owned rules in an existing
\`AGENTS.md\` or \`CLAUDE.md\` take precedence.

## Operating contract

- Rule precedence is project-owned root rules, then this summary, then focused Harness guides, then provider entry points.
- Inspect relevant source and tests before changing behavior.
- Keep changes inside the authorized project and preserve unrelated work.
- Treat requests/specs as expected behavior and code/Git/tests/builds as implementation facts; report material differences.
- Use commands declared in \`harness.config.yaml\`; do not invent replacements.
- Search active changes before creating Level 2/3 work and load only the current stage's context.
- Level 1 uses no change package. Level 2 requires tasks plus delta specs. Level 3 requires the complete proposal-through-archive lifecycle.
- Choose verification evidence according to risk. Security, persistence, public
  contracts, and critical transformations require automated regression evidence.
- Engineering verification does not replace semantic spec review. Applicable high-risk review uses an independent evaluator that never edits code.
- Completion requires applicable tasks, verification, acceptance, review, spec sync, and archive gates—not implementation alone.
- Never commit, push, publish, install global tooling, or contact external
  services unless the user authorizes that action.

## Project profile

- Profile: \`${config.project.profile}\`
- Workflow: \`${config.workflow.provider}\`

## Commands

${commandList(config)}

Project-owned policy lives in \`harness/project-architecture.md\` and
\`harness/repository-assets.md\`. Lifecycle, verification, review, and entropy
guidance lives in the other \`harness/\` documents.
`
}

function rootAgents(config: HarnessConfig): string {
  return `# AGENTS.md — ${config.project.name}

Read \`AGENT_HARNESS.md\` before modifying this project. Project owners may add
more restrictive rules below this notice.
`
}

function architecture(config: HarnessConfig): string {
  return `# Project architecture

This file records detected structure, not inferred business behavior. Edit
\`harness.config.yaml\` when the project structure changes, then run
\`agent-harness update\`.

## Source roots

${list(config.architecture.sourceRoots, 'No source root detected; configure explicitly.')}

## Test roots

${list(config.architecture.testRoots, 'No test root detected; configure explicitly.')}

## Dependency policy

This managed file contains detected facts only. Define allowed dependency
directions and enforcement in the project-owned
[architecture policy](project-architecture.md) before enabling a named architecture gate.
`
}

function verification(config: HarnessConfig): string {
  return `# Verification strategy

Run the smallest evidence that distinguishes the changed risk, then broaden only
when the change crosses contracts or release boundaries.

The CLI runs only commands declared in \`harness.config.yaml\`:

${commandList(config)}

Passing output is summarized. On failure, stop after the first failing command,
inspect that failure, and do not hide unrelated baseline failures.

Level 1 runs the smallest evidence that distinguishes the changed risk. Level 2
adds affected project commands, semantic review, scoped workflow gates, and spec
sync. Level 3 runs focused checks during development; only a converged frozen
candidate receives final semantic review, independent review, and full gates.
`
}

function iterationGuide(): string {
  return `# Portable Harness iteration guide

OpenSpec records what must change; Harness controls how work is routed, implemented, verified, reviewed, and archived.

## Levels

- Level 1: low-risk local work. No change package; use focused verification.
- Level 2: bounded formal behavior change. Require tasks plus delta specs, affected verification, semantic review, and spec sync.
- Level 3: architecture or high-risk change. Require proposal, specs, design, tasks, implementation, candidate freeze, semantic review, independent review, full gates, sync, and archive.

Choose levels from contracts, architecture, security, persistence, and rollback risk—not file count. Before creating Level 2/3 work, search active changes for the same capability, user outcome, scenario, call chain, or feedback lifecycle.

## Active-change association

Inspect \`openspec/changes/\` excluding \`archive/\`. Reuse an active change when it has the same formal capability, user outcome, acceptance scenario, core call chain, or pre-freeze feedback. A shared filename or keyword is discovery evidence, not sufficient association by itself. Never rewrite an archived change.

## Required artifacts

- Level 2: \`tasks.md\` with \`workflow_level: 2\` and at least one checklist task, plus one or more \`specs/<capability>/spec.md\` delta specs.
- Level 3: \`proposal.md\`, \`design.md\`, Level 3 \`tasks.md\`, delta specs, then \`review.md\` and \`iteration.md\` before archive.
- ADDED/MODIFIED Requirements need a Scenario containing WHEN and THEN. REMOVED Requirements need Reason and Migration. RENAMED sections need FROM and TO.

## Stage protocol

1. Propose: associate active work, choose the lowest justified level, state non-goals, and create only required artifacts.
2. Apply: select the first incomplete required task, read its relevant spec/design/source/tests, obtain a failing or discriminating check, implement, rerun focused evidence, and update the task plus evidence.
3. Verify: run \`agent-harness gate --level <n> --stage verify --change <name>\`, then the applicable named project gates from \`harness.config.yaml\`.
4. Review: compare implementation with every applicable Requirement/Scenario for completeness, correctness, and consistency. Record discrepancies rather than silently changing the spec.
5. Freeze: only after required tasks, acceptance, and focused evidence converge. Formal behavior or core implementation changes unfreeze the candidate and invalidate affected review evidence.
6. Archive: sync delta specs into living \`openspec/specs/\`, complete the strict review and iteration records, run the archive gate, request required human semantic confirmations, then move the change under \`openspec/changes/archive/\`.

Load context progressively: root rules first, then only the active stage's guide and change artifacts. OpenSpec CLI commands are optional; the on-disk artifact contract is not.
`
}

function codeReviewGuide(): string {
  return `# Independent code review

Use an evaluator context independent from the implementing Agent. The evaluator reads project rules, architecture policy, specs, design, tests, and the candidate diff; it reports findings and MUST NOT modify files.

Level 1 does not require independent review. Level 2 uses it for public contracts, core data, security, or high-risk cross-module work. Level 3 uses it once after candidate freeze. Formal behavior or core-code changes invalidate affected review evidence.

The evaluator reports \`ACCEPT\` or \`REJECT\`, then MUST FIX findings with file/line evidence, WARNING findings, verification executed, and residual risks. The implementing Agent fixes findings, reruns affected evidence, freezes a new candidate, and requests a fresh independent review. Only a passing review may set \`independent_review: passed\` in the strict review record.
`
}

function entropyRules(): string {
  return `# Harness entropy and archive rules

Deterministic gates check relative links, workflow level, required tasks, delta structure, provider mirrors, sync declarations, and summary references. Semantic rule conflicts and template-candidate value require Agent analysis and human confirmation.

Level 1 has no archive. Level 2 reconciles and syncs delta specs. Level 3 additionally freezes the candidate, records reviews, synchronizes living specs, archives the change, and writes an iteration record.

## Strict review record

Create \`review.md\` from \`harness/templates/review.md\`. Fields are unique, line-anchored declarations. Level 2 independent review is \`passed\` or \`not_applicable\`; the latter requires a concrete reason. Level 3 independent review must be \`passed\`. Conflicting or duplicate declarations fail closed.

## Iteration learning

Create Level 3 \`iteration.md\` from \`harness/templates/iteration.md\`. Record non-empty Outcomes, Problems, Lessons, Project Harness Updates, and Template Candidates. “None” is an explicit decision; a reusable template candidate still requires human confirmation before changing this framework.

Before archive, run \`agent-harness gate --level <n> --stage archive --change <name>\`. Archive only after it passes and required human confirmations are recorded.
`
}

function reviewTemplate(): string {
  return `# Review evidence

engineering_verification: pending
semantic_review: pending
independent_review: pending
independent_review_reason:
spec_sync: pending

Each declaration must appear exactly once. Allowed final values are documented in \`../entropy-rules.md\`.
`
}

function iterationTemplate(): string {
  return `# Iteration record

## Outcomes
<!-- Required: delivered outcomes and acceptance result. -->

## Problems
<!-- Required: problems encountered, or explicitly write None. -->

## Lessons
<!-- Required: reusable lessons from this iteration. -->

## Project Harness Updates
<!-- Required: project-local governance updates, or explicitly write None. -->

## Template Candidates
<!-- Required: portable candidates needing human confirmation, or explicitly write None. -->
`
}

function projectArchitecture(config: HarnessConfig): string {
  return `# Project-owned architecture policy

This file belongs to the project. Agent Harness Init will not update or remove it.

## Detected source roots

${list(config.architecture.sourceRoots, 'No source root detected; define project facts explicitly.')}

## Detected test roots

${list(config.architecture.testRoots, 'No test root detected; define project facts explicitly.')}

Define the project's real layers, allowed dependency directions, naming rules, cohesive size guidance, directory ownership, and test placement here. Do not copy another project's domain architecture.
`
}

function repositoryAssets(): string {
  return `# Project-owned repository asset policy

This file belongs to the project. Define canonical assets, generated outputs that must remain untracked, sensitive-data exclusions, and any executable asset gate.

All examples and fixtures MUST be clearly marked SYNTHETIC, TEST, or FIXTURE. Never copy real user, customer, production, legal, medical, financial, device, or credential data into fixtures.
`
}

function openspecConfig(): string {
  return `schema: spec-driven
context: |
  This project uses Agent Harness Init's portable Level 1/2/3 workflow.
rules:
  proposal:
    - Include non-goals, capabilities, and rollout impact.
  specs:
    - Every Requirement has at least one observable Scenario with WHEN and THEN.
  design:
    - Record architecture decisions, risks, compatibility, and alternatives.
  tasks:
    - Declare workflow_level and name applicable verification evidence.
`
}

const skillDefinitions = [
  ['propose', 'Route a new requirement and create the justified artifacts.', 'Read harness/iteration-guide.md. Inspect active changes, report association candidates and exclusions, choose the lowest justified level from contracts/risk, then create no package for Level 1, tasks+deltas for Level 2, or proposal+design+tasks+deltas for Level 3. Run the plan gate before implementation.'],
  ['apply', 'Implement required tasks with bounded context and evidence.', 'Read harness/iteration-guide.md and harness/verification.md. Select the first incomplete required task; read only its relevant artifacts/source/tests; run a failing or discriminating check; implement within project architecture; rerun focused evidence; update the task and evidence without claiming unrelated completion.'],
  ['fix', 'Diagnose and repair defects without losing regression evidence.', 'Reproduce first, distinguish expected behavior from implementation fact, associate active work, choose the justified level, add or update only evidence that distinguishes the regression, implement the smallest coherent fix, and rerun affected gates.'],
  ['continue', 'Resume an active change from its next valid action.', 'Run agent-harness status, select the explicitly named or unambiguous active change, read its tasks and only the current-stage artifacts, then resume the first incomplete required task. Stop and report if multiple candidates remain materially ambiguous.'],
  ['status', 'Report active changes and next lifecycle actions.', 'Run agent-harness status --root . and summarize each active change level and required-task progress. Inspect review/iteration evidence only when determining freeze or archive readiness; do not modify files.'],
  ['verify', 'Run structural and engineering gates without conflating them.', 'Read harness/verification.md. Run agent-harness gate for the current level/stage, then agent-harness verify for configured named project gates. Stop on the first failure, diagnose it, and report engineering evidence separately from semantic review.'],
  ['semantic-review', 'Perform semantic completeness, correctness, and consistency review.', 'Read the active delta/living specs, design, tasks, project architecture, implementation diff, and evidence. Map every Requirement and Scenario to observable implementation; report missing, incorrect, contradictory, or stale behavior. Do not treat passing tests as semantic proof and do not edit implementation during review.'],
  ['code-review', 'Run an independent, read-only candidate evaluation.', 'Read harness/code-review-agent.md. Use an evaluator context independent from the implementer after candidate freeze. Require ACCEPT/REJECT, severity, file/line evidence, executed checks, and residual risk. The evaluator MUST NOT edit; formal fixes require a new frozen candidate and review.'],
  ['archive', 'Close a converged change with sync, entropy, and learning gates.', 'Read harness/entropy-rules.md. Confirm required tasks and acceptance, sync deltas into openspec/specs, complete review.md and Level 3 iteration.md from templates, obtain required human semantic confirmations, run the archive gate, then archive without rewriting prior archived changes.'],
] as const

function workflowProtocols(): string {
  return `# Executable workflow protocols

These provider-neutral protocols are the behavioral source for every generated Codex and Claude Harness Skill.

${skillDefinitions.map(([name, , protocol]) => `## Harness ${name}\n\n${protocol}`).join('\n\n')}
`
}

function workflowSkill(name: string, description: string): string {
  return `---
name: harness-${name}
description: ${description}
---

Read \`AGENT_HARNESS.md\` and \`harness.config.yaml\` first. Preserve user changes and stay within granted authority.

## Protocol

Follow [the provider-neutral Harness ${name} protocol](../../../harness/workflow-protocols.md#harness-${name}). Load only the current stage's artifacts named there.
`
}

function projectSkill(): string {
  return `---
name: agent-harness
description: Apply this project's Harness rules when implementing, fixing, reviewing, verifying, or planning changes in this repository.
---

Read \`AGENT_HARNESS.md\` and \`harness.config.yaml\`. Route work through the
portable Harness Level 1/2/3 contract, associate active changes, load context
progressively, preserve user changes, and collect risk-proportionate evidence.
Use \`agent-harness status\` and \`agent-harness gate\` for deterministic workflow
state; use \`doctor\` for managed-file drift and \`verify\` for configured project gates.
`
}

function installAgent(): string {
  return `# Installing Agent Harness with an AI agent

Ask your agent:

> Install and adapt Agent Harness Init to this project. Run a read-only plan
> first, preserve existing rules, apply only a conflict-free plan, then run
> doctor and report the result.

Deterministic protocol:

1. \`agent-harness plan --root .\`
2. Review detected commands and every conflict.
3. If conflict-free, run \`agent-harness init --root . --yes\`.
4. If an unowned \`AGENTS.md\` exists, inspect it and add only a reference to
   \`AGENT_HARNESS.md\` without weakening existing rules.
5. Run \`agent-harness doctor --root .\`.
6. Read the generated Level 1/2/3, OpenSpec, verification, review, architecture,
   asset, entropy, and archive policies and report any project-specific TODOs.

Do not authorize global Skill installation, repository creation, pushing, or
publishing merely from a project-local installation request.
`
}

export function renderArtifacts(facts: ProjectFacts, config: HarnessConfig, previouslyManaged: string[] = []): RenderedArtifact[] {
  const artifacts: RenderedArtifact[] = [
    { path: 'harness.config.yaml', content: serializeConfig(config), managed: false },
    { path: 'AGENT_HARNESS.md', content: agentHarness(config) },
    { path: 'harness/architecture.md', content: architecture(config) },
    { path: 'harness/verification.md', content: verification(config) },
    { path: 'harness/iteration-guide.md', content: iterationGuide() },
    { path: 'harness/workflow-protocols.md', content: workflowProtocols() },
    { path: 'harness/code-review-agent.md', content: codeReviewGuide() },
    { path: 'harness/entropy-rules.md', content: entropyRules() },
    { path: 'harness/templates/review.md', content: reviewTemplate() },
    { path: 'harness/templates/iteration.md', content: iterationTemplate() },
    { path: 'harness/project-architecture.md', content: projectArchitecture(config), managed: false },
    { path: 'harness/repository-assets.md', content: repositoryAssets(), managed: false },
    { path: 'openspec/config.yaml', content: openspecConfig(), managed: false },
    { path: 'INSTALL_AGENT.md', content: installAgent() },
  ]
  if (!facts.existingAgentFiles.includes('AGENTS.md') || previouslyManaged.includes('AGENTS.md')) {
    artifacts.push({ path: 'AGENTS.md', content: rootAgents(config) })
  }
  if (config.agents.includes('codex')) {
    artifacts.push({ path: '.agents/skills/agent-harness/SKILL.md', content: projectSkill() })
    for (const [name, description] of skillDefinitions) artifacts.push({ path: `.agents/skills/harness-${name}/SKILL.md`, content: workflowSkill(name, description) })
  }
  if (config.agents.includes('claude')) {
    artifacts.push({ path: '.claude/skills/agent-harness/SKILL.md', content: projectSkill() })
    for (const [name, description] of skillDefinitions) artifacts.push({ path: `.claude/skills/harness-${name}/SKILL.md`, content: workflowSkill(name, description) })
  }
  return artifacts.sort((left, right) => left.path.localeCompare(right.path))
}
