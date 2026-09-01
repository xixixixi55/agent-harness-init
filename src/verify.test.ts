import { describe, expect, it } from 'vitest'
import type { HarnessConfig } from './types.js'
import { runConfiguredVerification } from './verify.js'

function config(gates?: HarnessConfig['verification']): HarnessConfig {
  return {
    schemaVersion: 1,
    project: { name: 'SYNTHETIC', profile: 'custom' },
    agents: ['codex'],
    workflow: { provider: 'native' },
    architecture: { sourceRoots: [], testRoots: [] },
    commands: {},
    verification: gates,
  }
}

describe('configured verification', () => {
  it('runs named gates in order and stops after the first failure', () => {
    const results = runConfiguredVerification(process.cwd(), config({ gates: [
      { name: 'first', command: 'node -e "process.exit(0)"' },
      { name: 'blocking', command: 'node -e "process.exit(3)"' },
      { name: 'must-not-run', command: 'node -e "process.exit(0)"' },
    ] }))

    expect(results.map(({ name, status }) => ({ name, status }))).toEqual([
      { name: 'first', status: 0 },
      { name: 'blocking', status: 3 },
    ])
  })

  it('keeps the legacy commands contract as a fallback', () => {
    const legacy = config()
    legacy.commands.test = 'node -e "process.exit(0)"'
    expect(runConfiguredVerification(process.cwd(), legacy)).toEqual([
      expect.objectContaining({ name: 'test', status: 0 }),
    ])
  })
})
