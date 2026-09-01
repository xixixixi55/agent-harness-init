import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import type { ProjectCommands, ProjectFacts, ProjectProfile } from './types.js'

interface PackageJson {
  name?: string
  scripts?: Record<string, string>
  workspaces?: unknown
  packageManager?: string
}

function exists(root: string, relative: string): boolean {
  return existsSync(path.join(root, relative))
}

function readPackageJson(root: string): PackageJson | undefined {
  const packagePath = path.join(root, 'package.json')
  if (!existsSync(packagePath)) return undefined
  try {
    return JSON.parse(readFileSync(packagePath, 'utf8')) as PackageJson
  } catch {
    return undefined
  }
}

function npmCommand(script: string, scripts?: Record<string, string>): string | undefined {
  return scripts?.[script] ? `npm run ${script}` : undefined
}

function detectCommands(packageJson: PackageJson | undefined): ProjectCommands {
  const scripts = packageJson?.scripts
  return {
    build: npmCommand('build', scripts),
    typecheck: npmCommand('typecheck', scripts),
    lint: npmCommand('lint', scripts),
    test: npmCommand('test', scripts),
  }
}

function detectProfile(javaScript: boolean, python: boolean, monorepo: boolean): ProjectProfile {
  if (monorepo) return 'monorepo'
  if (javaScript && python) return 'fullstack'
  if (javaScript) return 'javascript'
  if (python) return 'python'
  return 'custom'
}

function detectGitDirty(root: string): boolean | null {
  const result = spawnSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8', windowsHide: true })
  return result.status === 0 ? result.stdout.trim().length > 0 : null
}

export function discoverProject(rootInput: string): ProjectFacts {
  const root = path.resolve(rootInput)
  const packageJson = readPackageJson(root)
  const javaScript = Boolean(packageJson)
  const python = exists(root, 'pyproject.toml') || exists(root, 'requirements.txt') || exists(root, 'setup.py')
  const monorepo = Boolean(packageJson?.workspaces) || exists(root, 'pnpm-workspace.yaml') || exists(root, 'lerna.json')
  const markers = [
    javaScript && 'package.json',
    exists(root, 'pnpm-workspace.yaml') && 'pnpm-workspace.yaml',
    exists(root, 'pyproject.toml') && 'pyproject.toml',
    exists(root, 'requirements.txt') && 'requirements.txt',
    exists(root, 'openspec') && 'openspec/',
  ].filter((value): value is string => Boolean(value))

  return {
    root,
    name: packageJson?.name ?? path.basename(root),
    profile: detectProfile(javaScript, python, monorepo),
    markers,
    sourceRoots: ['src', 'app', 'packages', 'lib'].filter((candidate) => exists(root, candidate)),
    testRoots: ['tests', 'test', '__tests__', 'e2e'].filter((candidate) => exists(root, candidate)),
    commands: detectCommands(packageJson),
    packageManager: packageJson?.packageManager?.split('@')[0],
    gitDirty: detectGitDirty(root),
    existingAgentFiles: ['AGENTS.md', 'CLAUDE.md', '.agents', '.claude'].filter((candidate) => exists(root, candidate)),
  }
}
