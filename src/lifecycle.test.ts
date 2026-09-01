import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { applyInstallPlan, diagnoseInstallation, uninstallManagedFiles } from './filesystem.js'
import { createInstallPlan } from './planner.js'

const roots: string[] = []

function fixture(): string {
  const root = mkdtempSync(path.join(tmpdir(), 'agent-harness-SYNTHETIC-'))
  roots.push(root)
  writeFileSync(path.join(root, 'package.json'), JSON.stringify({
    name: 'SYNTHETIC-lifecycle',
    scripts: { test: 'node --test' },
  }))
  return root
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

describe('managed lifecycle', () => {
  it('plans without writes, applies, and diagnoses a clean install', () => {
    const root = fixture()
    const plan = createInstallPlan(root, '0.1.0')

    expect(plan.conflicts).toEqual([])
    expect(existsSync(path.join(root, '.harness'))).toBe(false)

    const manifest = applyInstallPlan(plan, new Date('2026-01-02T03:04:05.000Z'))
    expect(manifest.files['harness.config.yaml']).toBeUndefined()
    expect(manifest.files['harness/project-architecture.md']).toBeUndefined()
    expect(manifest.files['harness/repository-assets.md']).toBeUndefined()
    expect(manifest.files['openspec/config.yaml']).toBeUndefined()
    expect(existsSync(path.join(root, 'harness.config.yaml'))).toBe(true)
    expect(existsSync(path.join(root, 'harness', 'project-architecture.md'))).toBe(true)
    expect(existsSync(path.join(root, '.agents', 'skills', 'harness-archive', 'SKILL.md'))).toBe(true)
    expect(existsSync(path.join(root, '.claude', 'skills', 'harness-archive', 'SKILL.md'))).toBe(true)
    expect(diagnoseInstallation(root).every((finding) => finding.status === 'ok')).toBe(true)
  })

  it('preserves user config during update planning', () => {
    const root = fixture()
    applyInstallPlan(createInstallPlan(root, '0.1.0'))
    const configPath = path.join(root, 'harness.config.yaml')
    const customized = readFileSync(configPath, 'utf8').replace('provider: native', 'provider: openspec')
    writeFileSync(configPath, customized)

    const update = createInstallPlan(root, '0.1.1')
    expect(update.artifacts.some((artifact) => artifact.path === 'harness.config.yaml')).toBe(false)
    expect(readFileSync(configPath, 'utf8')).toBe(customized)
  })

  it('preserves existing project-owned config and OpenSpec policy on first install', () => {
    const root = fixture()
    const config = 'schemaVersion: 1\nproject:\n  name: SYNTHETIC-existing\n  profile: custom\nagents: [codex]\nworkflow:\n  provider: openspec\narchitecture:\n  sourceRoots: []\n  testRoots: []\ncommands: {}\n'
    writeFileSync(path.join(root, 'harness.config.yaml'), config)
    const openspecRoot = path.join(root, 'openspec')
    mkdirSync(openspecRoot, { recursive: true })
    writeFileSync(path.join(openspecRoot, 'config.yaml'), 'schema: spec-driven\ncontext: SYNTHETIC existing policy\n')

    const plan = createInstallPlan(root, '0.2.0')
    expect(plan.conflicts).toEqual([])
    expect(plan.artifacts.some((artifact) => artifact.path === 'harness.config.yaml')).toBe(false)
    expect(plan.artifacts.some((artifact) => artifact.path === 'openspec/config.yaml')).toBe(false)
    applyInstallPlan(plan)
    expect(readFileSync(path.join(root, 'harness.config.yaml'), 'utf8')).toBe(config)
    expect(readFileSync(path.join(openspecRoot, 'config.yaml'), 'utf8')).toContain('SYNTHETIC existing policy')
  })

  it('preserves project-owned architecture and asset policies during updates', () => {
    const root = fixture()
    applyInstallPlan(createInstallPlan(root, '0.1.0'))
    const architecturePath = path.join(root, 'harness', 'project-architecture.md')
    const assetPath = path.join(root, 'harness', 'repository-assets.md')
    writeFileSync(architecturePath, 'SYNTHETIC project architecture\n')
    writeFileSync(assetPath, 'SYNTHETIC project assets\n')

    const update = createInstallPlan(root, '0.2.0')
    expect(update.artifacts.some((artifact) => artifact.path === 'harness/project-architecture.md')).toBe(false)
    expect(update.artifacts.some((artifact) => artifact.path === 'harness/repository-assets.md')).toBe(false)
  })

  it('initializes a missing project-owned policy during a backward-compatible update', () => {
    const root = fixture()
    applyInstallPlan(createInstallPlan(root, '0.1.0'))
    const architecturePath = path.join(root, 'harness', 'project-architecture.md')
    rmSync(architecturePath)

    const update = createInstallPlan(root, '0.2.0')
    expect(update.artifacts).toContainEqual(expect.objectContaining({
      path: 'harness/project-architecture.md',
      action: 'create',
      managed: false,
    }))
  })

  it('retains ownership of a managed AGENTS.md across a 0.1 manifest upgrade', () => {
    const root = fixture()
    const installed = applyInstallPlan(createInstallPlan(root, '0.1.0'))
    const oldManifest = {
      ...installed,
      framework: { ...installed.framework, version: '0.1.0' },
      files: { 'AGENTS.md': installed.files['AGENTS.md'] },
    }
    for (const managedPath of Object.keys(installed.files).filter((managedPath) => managedPath !== 'AGENTS.md')) {
      rmSync(path.join(root, ...managedPath.split('/')), { force: true })
    }
    writeFileSync(path.join(root, '.harness', 'manifest.json'), `${JSON.stringify(oldManifest, null, 2)}\n`)

    const update = createInstallPlan(root, '0.2.0')
    expect(update.artifacts).toContainEqual(expect.objectContaining({ path: 'AGENTS.md', action: 'unchanged' }))
    const upgraded = applyInstallPlan(update)
    expect(upgraded.files['AGENTS.md']).toBeDefined()
    expect(diagnoseInstallation(root)).toContainEqual({ path: 'AGENTS.md', status: 'ok' })
  })

  it('reports a modified managed file and refuses to overwrite it', () => {
    const root = fixture()
    applyInstallPlan(createInstallPlan(root, '0.1.0'))
    const managedPath = path.join(root, 'AGENT_HARNESS.md')
    writeFileSync(managedPath, 'SYNTHETIC user edit\n')

    expect(diagnoseInstallation(root)).toContainEqual({ path: 'AGENT_HARNESS.md', status: 'modified' })
    const update = createInstallPlan(root, '0.1.1')
    expect(update.conflicts).toContain('AGENT_HARNESS.md')
    expect(() => applyInstallPlan(update)).toThrow(/conflicts/)
    expect(readFileSync(managedPath, 'utf8')).toBe('SYNTHETIC user edit\n')
  })

  it('safe uninstall removes unchanged files and preserves modified files and project config', () => {
    const root = fixture()
    applyInstallPlan(createInstallPlan(root, '0.1.0'))
    const managedPath = path.join(root, 'AGENT_HARNESS.md')
    writeFileSync(managedPath, 'SYNTHETIC preserve me\n')

    uninstallManagedFiles(root)

    expect(readFileSync(managedPath, 'utf8')).toBe('SYNTHETIC preserve me\n')
    expect(existsSync(path.join(root, 'harness.config.yaml'))).toBe(true)
    expect(existsSync(path.join(root, 'INSTALL_AGENT.md'))).toBe(false)
    expect(existsSync(path.join(root, '.harness', 'manifest.json'))).toBe(true)
  })

  it('treats an existing unowned destination as a conflict', () => {
    const root = fixture()
    writeFileSync(path.join(root, 'AGENT_HARNESS.md'), 'SYNTHETIC existing file\n')
    const plan = createInstallPlan(root, '0.1.0')
    expect(plan.conflicts).toContain('AGENT_HARNESS.md')
  })

  it('does not adopt an identical unowned managed destination', () => {
    const root = fixture()
    const initial = createInstallPlan(root, '0.1.0')
    const agentHarness = initial.artifacts.find((artifact) => artifact.path === 'AGENT_HARNESS.md')
    expect(agentHarness).toBeDefined()
    writeFileSync(path.join(root, 'AGENT_HARNESS.md'), agentHarness!.content)

    const plan = createInstallPlan(root, '0.1.0')
    expect(plan.artifacts).toContainEqual(expect.objectContaining({ path: 'AGENT_HARNESS.md', action: 'conflict' }))
    expect(() => applyInstallPlan(plan)).toThrow(/conflicts/)
  })
})
