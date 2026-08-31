import type { HarnessConfig, ProjectFacts, RenderedArtifact } from './types.js'
import { serializeConfig } from './config.js'

function list(values: string[], fallback: string): string {
  return values.length > 0 ? values.map((value) => `- \`${value}/\``).join('\n') : `- ${fallback}`
}

function commandList(config: HarnessConfig): string {
  const entries = Object.entries(config.commands).filter((entry): entry is [string, string] => Boolean(entry[1]))
  if (entries.length === 0) return '- No commands detected. Configure `harness.config.yaml` before verification.'
  return entries.map(([name, command]) => `- ${name}: \`${command}\``).join('\n')
}

function agentHarness(config: HarnessConfig): string {
  return `# Agent Harness — ${config.project.name}

This file is managed by Agent Harness Init. Project-specific rules in an existing
\`AGENTS.md\` or \`CLAUDE.md\` take precedence when they are more restrictive.

## Operating contract

- Inspect relevant source and tests before changing behavior.
- Keep changes inside the authorized project and preserve unrelated work.
- Use commands declared in \`harness.config.yaml\`; do not invent replacements.
- Choose verification evidence according to risk. Security, persistence, public
  contracts, and critical transformations require automated regression evidence.
- Never commit, push, publish, install global tooling, or contact external
  services unless the user authorizes that action.

## Project profile

- Profile: \`${config.project.profile}\`
- Workflow: \`${config.workflow.provider}\`

## Commands

${commandList(config)}

Detailed architecture and verification guidance lives in \`harness/\`.
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

Architecture boundaries are project-owned. Define allowed dependency directions
here or in a dedicated project rule before enabling an architecture lint gate.
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
`
}

function projectSkill(): string {
  return `---
name: agent-harness
description: Apply this project's Harness rules when implementing, fixing, reviewing, verifying, or planning changes in this repository.
---

Read \`AGENT_HARNESS.md\` and \`harness.config.yaml\`. Load only directly relevant
project source, tests, and Harness guidance. Preserve user changes and run
verification proportionate to actual risk. Use \`agent-harness doctor\` to
diagnose managed-file drift and \`agent-harness verify\` only when requested or
when implementation completion requires the configured project gates.
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

Do not authorize global Skill installation, repository creation, pushing, or
publishing merely from a project-local installation request.
`
}

export function renderArtifacts(facts: ProjectFacts, config: HarnessConfig): RenderedArtifact[] {
  const artifacts: RenderedArtifact[] = [
    { path: 'harness.config.yaml', content: serializeConfig(config) },
    { path: 'AGENT_HARNESS.md', content: agentHarness(config) },
    { path: 'harness/architecture.md', content: architecture(config) },
    { path: 'harness/verification.md', content: verification(config) },
    { path: 'INSTALL_AGENT.md', content: installAgent() },
  ]
  if (!facts.existingAgentFiles.includes('AGENTS.md')) {
    artifacts.push({ path: 'AGENTS.md', content: rootAgents(config) })
  }
  if (config.agents.includes('codex')) {
    artifacts.push({ path: '.agents/skills/agent-harness/SKILL.md', content: projectSkill() })
  }
  if (config.agents.includes('claude')) {
    artifacts.push({ path: '.claude/skills/agent-harness/SKILL.md', content: projectSkill() })
  }
  return artifacts.sort((left, right) => left.path.localeCompare(right.path))
}
