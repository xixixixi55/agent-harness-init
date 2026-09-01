import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { parse, stringify } from 'yaml'
import type { AgentProvider, HarnessConfig, ProjectFacts } from './types.js'

export function configFromFacts(facts: ProjectFacts, agents: AgentProvider[] = ['codex', 'claude']): HarnessConfig {
  return {
    schemaVersion: 1,
    project: { name: facts.name, profile: facts.profile },
    agents,
    workflow: { provider: 'openspec' },
    architecture: { sourceRoots: facts.sourceRoots, testRoots: facts.testRoots },
    commands: facts.commands,
    verification: {
      gates: (['lint', 'typecheck', 'test', 'build'] as const)
        .flatMap((name) => facts.commands[name] ? [{ name, command: facts.commands[name] }] : []),
    },
  }
}

export function serializeConfig(config: HarnessConfig): string {
  return stringify(config, { lineWidth: 100 })
}

export function loadConfig(root: string): HarnessConfig {
  const configPath = path.join(root, 'harness.config.yaml')
  if (!existsSync(configPath)) throw new Error('harness.config.yaml is missing; run init first')
  const value = parse(readFileSync(configPath, 'utf8')) as HarnessConfig
  const validProject = typeof value?.project?.name === 'string' && value.project.name.trim().length > 0
    && ['javascript', 'python', 'fullstack', 'monorepo', 'custom'].includes(value.project.profile)
  const validProviders = Array.isArray(value?.agents) && value.agents.length > 0
    && value.agents.every((agent) => agent === 'codex' || agent === 'claude')
    && new Set(value.agents).size === value.agents.length
  const validWorkflow = value?.workflow?.provider === 'native' || value?.workflow?.provider === 'openspec'
  const validArchitecture = Array.isArray(value?.architecture?.sourceRoots) && value.architecture.sourceRoots.every((entry) => typeof entry === 'string')
    && Array.isArray(value?.architecture?.testRoots) && value.architecture.testRoots.every((entry) => typeof entry === 'string')
  const commandKeys = ['build', 'typecheck', 'lint', 'test']
  const validCommands = value?.commands && typeof value.commands === 'object' && !Array.isArray(value.commands)
    && Object.keys(value.commands).every((key) => commandKeys.includes(key))
    && Object.values(value.commands).every((command) => command === undefined || (typeof command === 'string' && command.trim().length > 0))
  const gates = value?.verification?.gates
  const validVerificationShape = value?.verification === undefined || (typeof value.verification === 'object' && !Array.isArray(value.verification)
    && Object.keys(value.verification).every((key) => key === 'gates') && Array.isArray(gates))
  const validGates = gates === undefined || (Array.isArray(gates)
    && gates.every((gate) => gate && typeof gate.name === 'string' && gate.name.trim().length > 0
      && typeof gate.command === 'string' && gate.command.trim().length > 0)
    && new Set(gates.map((gate) => gate.name)).size === gates.length)
  if (value?.schemaVersion !== 1 || !validProject || !validProviders || !validWorkflow || !validArchitecture || !validCommands || !validVerificationShape || !validGates) {
    throw new Error('harness.config.yaml is invalid or unsupported')
  }
  return value
}
