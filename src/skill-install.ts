import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { AgentProvider } from './types.js'

function packageRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
}

function providerSkillRoot(provider: AgentProvider): string {
  if (provider === 'codex') {
    return path.join(process.env.CODEX_HOME || path.join(homedir(), '.codex'), 'skills')
  }
  return path.join(homedir(), '.claude', 'skills')
}

export function installBootstrapSkill(provider: AgentProvider, force = false): string {
  const sourceRoot = path.join(packageRoot(), 'skills', 'agent-harness-init')
  const destinationRoot = path.join(providerSkillRoot(provider), 'agent-harness-init')
  if (!existsSync(path.join(sourceRoot, 'SKILL.md'))) {
    throw new Error(`Packaged Bootstrap Skill is missing at ${sourceRoot}`)
  }
  if (existsSync(destinationRoot) && !force) {
    throw new Error(`Skill destination already exists: ${destinationRoot}; use --force only after review`)
  }
  for (const relativePath of ['SKILL.md', 'agents/openai.yaml', 'references/install-protocol.md']) {
    const source = path.join(sourceRoot, ...relativePath.split('/'))
    if (!existsSync(source)) continue
    const destination = path.join(destinationRoot, ...relativePath.split('/'))
    mkdirSync(path.dirname(destination), { recursive: true })
    writeFileSync(destination, readFileSync(source))
  }
  return destinationRoot
}
