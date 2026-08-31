import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { parse, stringify } from 'yaml'
import type { AgentProvider, HarnessConfig, ProjectFacts } from './types.js'

export function configFromFacts(facts: ProjectFacts, agents: AgentProvider[] = ['codex', 'claude']): HarnessConfig {
  return {
    schemaVersion: 1,
    project: { name: facts.name, profile: facts.profile },
    agents,
    workflow: { provider: facts.markers.includes('openspec/') ? 'openspec' : 'native' },
    architecture: { sourceRoots: facts.sourceRoots, testRoots: facts.testRoots },
    commands: facts.commands,
  }
}

export function serializeConfig(config: HarnessConfig): string {
  return stringify(config, { lineWidth: 100 })
}

export function loadConfig(root: string): HarnessConfig {
  const configPath = path.join(root, 'harness.config.yaml')
  if (!existsSync(configPath)) throw new Error('harness.config.yaml is missing; run init first')
  const value = parse(readFileSync(configPath, 'utf8')) as HarnessConfig
  if (value?.schemaVersion !== 1 || !value.project?.name || !value.commands) {
    throw new Error('harness.config.yaml is invalid or unsupported')
  }
  return value
}
