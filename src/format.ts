import type { DoctorFinding, InstallPlan } from './types.js'

export function formatPlan(plan: InstallPlan): string {
  const lines = [
    `Agent Harness plan | root=${plan.root}`,
    `profile=${plan.facts.profile} | gitDirty=${String(plan.facts.gitDirty)} | markers=${plan.facts.markers.join(',') || 'none'}`,
  ]
  for (const artifact of plan.artifacts) {
    lines.push(`${artifact.action.toUpperCase().padEnd(9)} ${artifact.path} — ${artifact.reason}`)
  }
  lines.push(`conflicts=${plan.conflicts.length}`)
  return lines.join('\n')
}

export function formatDoctor(findings: DoctorFinding[]): string {
  return findings.map((finding) => `${finding.status.toUpperCase().padEnd(8)} ${finding.path}`).join('\n')
}
