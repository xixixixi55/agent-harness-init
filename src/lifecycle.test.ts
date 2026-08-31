import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
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
    expect(existsSync(path.join(root, 'harness.config.yaml'))).toBe(true)
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
})
