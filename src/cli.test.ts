import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { runCli } from './cli.js'

const roots: string[] = []

afterEach(() => {
  vi.restoreAllMocks()
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

describe('workflow CLI', () => {
  it('returns a stable gate failure exit code', () => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined)
    expect(runCli(['gate', '--level', '2', '--stage', 'plan', '--change', '../outside'])).toBe(2)
    expect(runCli(['gate', '--level', '2', '--stage', 'plan'])).toBe(2)
  })

  it('returns non-zero for incomplete work and zero for an archive-ready change', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'agent-harness-cli-SYNTHETIC-'))
    roots.push(root)
    const change = path.join(root, 'openspec', 'changes', 'synthetic-change')
    mkdirSync(path.join(change, 'specs', 'capability'), { recursive: true })
    writeFileSync(path.join(change, 'tasks.md'), 'workflow_level: 2\n- [ ] T001 SYNTHETIC\n')
    writeFileSync(path.join(change, 'specs', 'capability', 'spec.md'), '## ADDED Requirements\n### Requirement: SYNTHETIC\n#### Scenario: SYNTHETIC\n- **WHEN** synthetic\n- **THEN** synthetic\n')
    vi.spyOn(console, 'log').mockImplementation(() => undefined)
    expect(runCli(['gate', '--root', root, '--level', '2', '--stage', 'archive', '--change', 'synthetic-change'])).toBe(2)

    writeFileSync(path.join(change, 'tasks.md'), 'workflow_level: 2\n- [x] T001 SYNTHETIC\n')
    writeFileSync(path.join(change, 'review.md'), 'engineering_verification: passed\nsemantic_review: passed\nindependent_review: not_applicable\nindependent_review_reason: No public contract, core data, security, or cross-module risk.\nspec_sync: complete\n')
    mkdirSync(path.join(root, 'openspec', 'specs', 'capability'), { recursive: true })
    writeFileSync(path.join(root, 'openspec', 'specs', 'capability', 'spec.md'), '# SYNTHETIC\n')
    mkdirSync(path.join(root, 'harness'), { recursive: true })
    writeFileSync(path.join(root, 'harness.config.yaml'), 'agents:\n  - codex\n')
    writeFileSync(path.join(root, 'harness', 'project-architecture.md'), '# SYNTHETIC\n')
    writeFileSync(path.join(root, 'harness', 'repository-assets.md'), '# SYNTHETIC\n')
    writeFileSync(path.join(root, 'harness', 'workflow-protocols.md'), '# SYNTHETIC\n')
    writeFileSync(path.join(root, 'AGENT_HARNESS.md'), 'harness/project-architecture.md\nharness/repository-assets.md\n')
    for (const name of ['propose', 'apply', 'fix', 'continue', 'status', 'verify', 'semantic-review', 'code-review', 'archive']) {
      const skill = path.join(root, '.agents', 'skills', `harness-${name}`)
      mkdirSync(skill, { recursive: true })
      writeFileSync(path.join(skill, 'SKILL.md'), `---\nname: harness-${name}\n---\n[protocol](../../../harness/workflow-protocols.md#harness-${name})\n`)
    }
    expect(runCli(['gate', '--root', root, '--level', '2', '--stage', 'archive', '--change', 'synthetic-change'])).toBe(0)
  })

  it('reports active change status', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'agent-harness-cli-SYNTHETIC-'))
    roots.push(root)
    const change = path.join(root, 'openspec', 'changes', 'synthetic-change')
    mkdirSync(change, { recursive: true })
    writeFileSync(path.join(change, 'tasks.md'), 'workflow_level: 2\n- [x] T001 SYNTHETIC\n')
    const output: string[] = []
    vi.spyOn(console, 'log').mockImplementation((value) => output.push(String(value)))
    expect(runCli(['status', '--root', root])).toBe(0)
    expect(output).toContain('synthetic-change | level=2 | tasks=1/1')
  })

  it('fails closed on unknown or missing option values', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(runCli(['status', '--unknown'])).toBe(1)
    expect(runCli(['status', '--root'])).toBe(1)
  })
})
