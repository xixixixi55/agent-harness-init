import { spawnSync } from 'node:child_process'
import type { HarnessConfig } from './types.js'

export interface VerificationResult { name: string; command: string; status: number }

export function runConfiguredVerification(root: string, config: HarnessConfig): VerificationResult[] {
  const named = config.verification?.gates
  if (named && named.length > 0) {
    const results: VerificationResult[] = []
    for (const gate of named) {
      const result = spawnSync(gate.command, { cwd: root, shell: true, stdio: 'inherit', windowsHide: true })
      const status = result.status ?? 1
      results.push({ name: gate.name, command: gate.command, status })
      if (status !== 0) break
    }
    return results
  }
  const ordered = ['lint', 'typecheck', 'test', 'build'] as const
  const results: VerificationResult[] = []
  for (const name of ordered) {
    const command = config.commands[name]
    if (!command) continue
    const result = spawnSync(command, { cwd: root, shell: true, stdio: 'inherit', windowsHide: true })
    const status = result.status ?? 1
    results.push({ name, command, status })
    if (status !== 0) break
  }
  return results
}
