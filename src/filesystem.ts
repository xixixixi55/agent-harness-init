import { copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, unlinkSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { sha256 } from './hash.js'
import { loadManifest, manifestRelativePath, serializeManifest } from './manifest.js'
import { resolveInside } from './paths.js'
import type { DoctorFinding, HarnessManifest, InstallPlan } from './types.js'

function writeAtomic(target: string, content: string): void {
  mkdirSync(path.dirname(target), { recursive: true })
  const temporary = `${target}.agent-harness-${process.pid}.tmp`
  writeFileSync(temporary, content, 'utf8')
  renameSync(temporary, target)
}

export function applyInstallPlan(plan: InstallPlan, now = new Date()): HarnessManifest {
  if (plan.conflicts.length > 0) {
    throw new Error(`Installation has conflicts: ${plan.conflicts.join(', ')}`)
  }

  const previousManifest = loadManifest(plan.root)
  const transactionRoot = resolveInside(plan.root, `.harness/backups/${now.toISOString().replaceAll(':', '-')}`)
  const created: string[] = []
  const updated: Array<{ target: string; backup: string }> = []
  try {
    for (const artifact of plan.artifacts) {
      if (artifact.action === 'unchanged') continue
      const target = resolveInside(plan.root, artifact.path)
      if (artifact.action === 'update') {
        const backup = path.join(transactionRoot, ...artifact.path.split('/'))
        mkdirSync(path.dirname(backup), { recursive: true })
        copyFileSync(target, backup)
        updated.push({ target, backup })
      } else {
        created.push(target)
      }
      writeAtomic(target, artifact.content)
    }

    const manifest: HarnessManifest = {
      schemaVersion: 1,
      framework: { name: 'agent-harness-init', version: plan.frameworkVersion },
      installedAt: now.toISOString(),
      files: Object.fromEntries(
        plan.artifacts
          .filter((artifact) => artifact.path !== 'harness.config.yaml')
          .map((artifact) => [artifact.path, { hash: artifact.nextHash }]),
      ),
    }
    writeAtomic(resolveInside(plan.root, manifestRelativePath), serializeManifest(manifest))
    return manifest
  } catch (error) {
    for (const target of created.reverse()) {
      if (existsSync(target)) rmSync(target, { force: true })
    }
    for (const entry of updated.reverse()) copyFileSync(entry.backup, entry.target)
    if (previousManifest) {
      writeAtomic(resolveInside(plan.root, manifestRelativePath), serializeManifest(previousManifest))
    }
    throw error
  }
}

export function diagnoseInstallation(root: string): DoctorFinding[] {
  const manifest = loadManifest(root)
  if (!manifest) throw new Error('Harness is not installed: .harness/manifest.json is missing')
  return Object.entries(manifest.files).map(([relativePath, entry]) => {
    const target = resolveInside(root, relativePath)
    if (!existsSync(target)) return { path: relativePath, status: 'missing' as const }
    return { path: relativePath, status: sha256(readFileSync(target)) === entry.hash ? 'ok' as const : 'modified' as const }
  })
}

export function uninstallManagedFiles(root: string): DoctorFinding[] {
  const manifest = loadManifest(root)
  if (!manifest) throw new Error('Harness is not installed')
  const findings = diagnoseInstallation(root)
  const preserved: HarnessManifest['files'] = {}
  for (const finding of findings) {
    if (finding.status === 'ok') {
      unlinkSync(resolveInside(root, finding.path))
    } else {
      preserved[finding.path] = manifest.files[finding.path]
    }
  }
  const manifestPath = resolveInside(root, manifestRelativePath)
  if (Object.keys(preserved).length === 0) {
    unlinkSync(manifestPath)
  } else {
    writeAtomic(manifestPath, serializeManifest({ ...manifest, files: preserved }))
  }
  return findings
}
