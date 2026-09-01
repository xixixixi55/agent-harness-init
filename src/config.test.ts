import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { loadConfig } from './config.js'

const roots: string[] = []

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

function writeConfig(content: string): string {
  const root = mkdtempSync(path.join(tmpdir(), 'agent-harness-config-SYNTHETIC-'))
  roots.push(root)
  writeFileSync(path.join(root, 'harness.config.yaml'), content)
  return root
}

describe('project-owned config validation', () => {
  it('accepts legacy commands with no named gates', () => {
    const root = writeConfig('schemaVersion: 1\nproject:\n  name: SYNTHETIC\n  profile: custom\nagents: [codex]\nworkflow:\n  provider: native\narchitecture:\n  sourceRoots: []\n  testRoots: []\ncommands:\n  test: npm test\n')
    expect(loadConfig(root).commands.test).toBe('npm test')
  })

  it('rejects malformed providers and named gates before execution', () => {
    const root = writeConfig('schemaVersion: 1\nproject:\n  name: SYNTHETIC\n  profile: custom\nagents: [unknown]\nworkflow:\n  provider: openspec\narchitecture:\n  sourceRoots: []\n  testRoots: []\ncommands: {}\nverification:\n  gates:\n    - name: test\n      command: ""\n')
    expect(() => loadConfig(root)).toThrow(/invalid or unsupported/)
  })

  it('rejects malformed project, architecture, and command shapes', () => {
    const root = writeConfig('schemaVersion: 1\nproject:\n  name: 42\n  profile: mystery\nagents: [codex]\nworkflow:\n  provider: openspec\narchitecture:\n  sourceRoots: [1]\n  testRoots: []\ncommands:\n  guessed: npm test\n')
    expect(() => loadConfig(root)).toThrow(/invalid or unsupported/)
  })
})
