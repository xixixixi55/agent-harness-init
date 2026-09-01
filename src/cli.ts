#!/usr/bin/env node
import path from 'node:path'
import process from 'node:process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { loadConfig } from './config.js'
import { applyInstallPlan, diagnoseInstallation, uninstallManagedFiles } from './filesystem.js'
import { formatDoctor, formatPlan } from './format.js'
import { createInstallPlan } from './planner.js'
import { installBootstrapSkill } from './skill-install.js'
import { discoverChangeStatuses, evaluateWorkflowGate } from './workflow.js'
import type { AgentProvider, GateStage, WorkflowLevel } from './types.js'
import { runConfiguredVerification } from './verify.js'

interface ParsedArgs {
  command: string
  root: string
  yes: boolean
  force: boolean
  provider?: AgentProvider
  level?: WorkflowLevel
  stage?: GateStage
  change?: string
}

function packageVersion(): string {
  const packagePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'package.json')
  return (JSON.parse(readFileSync(packagePath, 'utf8')) as { version: string }).version
}

function parseArgs(argv: string[]): ParsedArgs {
  const command = argv[0] ?? 'help'
  let root = process.cwd()
  let provider: AgentProvider | undefined
  let level: WorkflowLevel | undefined
  let stage: GateStage | undefined
  let change: string | undefined
  let yes = false
  let force = false
  const valueAfter = (index: number, option: string): string => {
    const value = argv[index + 1]
    if (!value || value.startsWith('--')) throw new Error(`${option} requires a value`)
    return value
  }
  for (let index = 1; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--root') root = path.resolve(valueAfter(index++, '--root'))
    else if (arg === '--provider') {
      const value = valueAfter(index++, '--provider')
      if (value !== 'codex' && value !== 'claude') throw new Error('--provider must be codex or claude')
      provider = value
    } else if (arg === '--level') {
      const value = Number(valueAfter(index++, '--level'))
      if (value !== 1 && value !== 2 && value !== 3) throw new Error('--level must be 1, 2, or 3')
      level = value
    } else if (arg === '--stage') {
      const value = valueAfter(index++, '--stage')
      if (value !== 'plan' && value !== 'verify' && value !== 'archive') throw new Error('--stage must be plan, verify, or archive')
      stage = value
    } else if (arg === '--change') change = valueAfter(index++, '--change')
    else if (arg === '--yes') yes = true
    else if (arg === '--force') force = true
    else throw new Error(`unknown argument: ${arg}`)
  }
  return { command, root, provider, level, stage, change, yes, force }
}

function help(): string {
  return `Agent Harness Init

Usage:
  agent-harness plan [--root PATH]
  agent-harness init [--root PATH] --yes
  agent-harness update [--root PATH] --yes
  agent-harness doctor [--root PATH]
  agent-harness verify [--root PATH]
  agent-harness status [--root PATH]
  agent-harness gate --level 1|2|3 --stage plan|verify|archive [--change NAME] [--root PATH]
  agent-harness uninstall [--root PATH] --yes
  agent-harness install-skill --provider codex|claude [--force]
`
}

export function runCli(argv = process.argv.slice(2)): number {
  try {
    const args = parseArgs(argv)
    const version = packageVersion()
    if (args.command === 'help' || args.command === '--help' || args.command === '-h') {
      console.log(help())
      return 0
    }
    if (args.command === 'plan') {
      console.log(formatPlan(createInstallPlan(args.root, version)))
      return 0
    }
    if (args.command === 'init' || args.command === 'update') {
      const plan = createInstallPlan(args.root, version)
      console.log(formatPlan(plan))
      if (!args.yes) {
        console.error('Dry-run only. Re-run with --yes to apply this exact conflict-free plan.')
        return plan.conflicts.length > 0 ? 2 : 0
      }
      applyInstallPlan(plan)
      console.log(`Installed Agent Harness Init ${version}.`)
      return 0
    }
    if (args.command === 'doctor') {
      const findings = diagnoseInstallation(args.root)
      console.log(formatDoctor(findings))
      return findings.every((finding) => finding.status === 'ok') ? 0 : 2
    }
    if (args.command === 'verify') {
      const results = runConfiguredVerification(args.root, loadConfig(args.root))
      return results.every((result) => result.status === 0) ? 0 : 1
    }
    if (args.command === 'status') {
      const changes = discoverChangeStatuses(args.root)
      if (changes.length === 0) console.log('No active OpenSpec changes.')
      for (const change of changes) console.log(`${change.name} | level=${change.level ?? 'missing'} | tasks=${change.completedTasks}/${change.totalTasks}`)
      return 0
    }
    if (args.command === 'gate') {
      if (!args.level || !args.stage) throw new Error('gate requires --level 1|2|3 and --stage plan|verify|archive')
      const findings = evaluateWorkflowGate(args.root, args.level, args.stage, args.change)
      for (const finding of findings) console.log(`${finding.status === 'ok' ? 'OK' : 'ERROR'} ${finding.code} — ${finding.message}`)
      return findings.every((finding) => finding.status === 'ok') ? 0 : 2
    }
    if (args.command === 'uninstall') {
      if (!args.yes) throw new Error('Uninstall requires --yes')
      const findings = uninstallManagedFiles(args.root)
      console.log(formatDoctor(findings))
      return findings.every((finding) => finding.status === 'ok') ? 0 : 2
    }
    if (args.command === 'install-skill') {
      if (!args.provider) throw new Error('install-skill requires --provider codex|claude')
      console.log(`Installed Bootstrap Skill at ${installBootstrapSkill(args.provider, args.force)}`)
      return 0
    }
    console.error(help())
    return 1
  } catch (error) {
    console.error(`agent-harness: ${error instanceof Error ? error.message : String(error)}`)
    return 1
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = runCli()
}
