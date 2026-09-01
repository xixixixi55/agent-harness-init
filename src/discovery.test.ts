import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { discoverProject } from './discovery.js'

const roots: string[] = []

function fixture(): string {
  const root = mkdtempSync(path.join(tmpdir(), 'agent-harness-SYNTHETIC-'))
  roots.push(root)
  return root
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

describe('discoverProject', () => {
  it('detects a JavaScript project and existing commands', () => {
    const root = fixture()
    mkdirSync(path.join(root, 'src'))
    mkdirSync(path.join(root, 'test'))
    writeFileSync(path.join(root, 'package.json'), JSON.stringify({
      name: 'SYNTHETIC-js-app',
      scripts: { build: 'vite build', test: 'vitest run', typecheck: 'tsc --noEmit' },
    }))

    const facts = discoverProject(root)

    expect(facts.profile).toBe('javascript')
    expect(facts.sourceRoots).toEqual(['src'])
    expect(facts.testRoots).toEqual(['test'])
    expect(facts.commands).toEqual({
      build: 'npm run build',
      typecheck: 'npm run typecheck',
      lint: undefined,
      test: 'npm run test',
    })
  })

  it('uses custom without inventing commands', () => {
    const facts = discoverProject(fixture())
    expect(facts.profile).toBe('custom')
    expect(facts.commands).toEqual({ build: undefined, typecheck: undefined, lint: undefined, test: undefined })
  })

  it('does not guess pytest or adopt project-specific script aliases', () => {
    const root = fixture()
    writeFileSync(path.join(root, 'pyproject.toml'), '[project]\nname = "SYNTHETIC"\n')
    writeFileSync(path.join(root, 'package.json'), JSON.stringify({
      name: 'SYNTHETIC-mixed',
      scripts: { 'lint:arch': 'project-specific-check' },
    }))

    expect(discoverProject(root).commands).toEqual({
      build: undefined,
      typecheck: undefined,
      lint: undefined,
      test: undefined,
    })
  })
})
