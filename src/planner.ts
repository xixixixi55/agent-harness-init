import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { configFromFacts, loadConfig } from './config.js'
import { discoverProject } from './discovery.js'
import { sha256 } from './hash.js'
import { loadManifest } from './manifest.js'
import { renderArtifacts } from './render.js'
import type { AgentProvider, InstallPlan, PlannedArtifact } from './types.js'

function classify(root: string, pathValue: string, content: string, managed: boolean | undefined, managedHash?: string): PlannedArtifact {
  const target = path.join(root, ...pathValue.split('/'))
  const nextHash = sha256(content)
  if (!existsSync(target)) {
    return { path: pathValue, content, managed, action: 'create', reason: 'destination is absent', nextHash }
  }
  const currentHash = sha256(readFileSync(target))
  if (currentHash === nextHash) {
    if (managed === false || managedHash) {
      return { path: pathValue, content, managed, action: 'unchanged', reason: managed === false ? 'project-owned content already matches' : 'owned content already matches', nextHash, previousHash: currentHash }
    }
    return { path: pathValue, content, managed, action: 'conflict', reason: 'identical destination exists but is not owned by this installation', nextHash, previousHash: currentHash }
  }
  if (managedHash && currentHash === managedHash) {
    return { path: pathValue, content, managed, action: 'update', reason: 'unchanged managed file can be updated', nextHash, previousHash: currentHash }
  }
  return { path: pathValue, content, managed, action: 'conflict', reason: 'destination is unowned or was modified', nextHash, previousHash: currentHash }
}

export function createInstallPlan(
  root: string,
  frameworkVersion: string,
  agents: AgentProvider[] = ['codex', 'claude'],
): InstallPlan {
  const facts = discoverProject(root)
  const manifest = loadManifest(facts.root)
  const configExists = existsSync(path.join(facts.root, 'harness.config.yaml'))
  const config = manifest || configExists ? loadConfig(facts.root) : configFromFacts(facts, agents)
  const rendered = renderArtifacts(facts, config, Object.keys(manifest?.files ?? {})).filter((artifact) => {
    if (artifact.managed !== false) return true
    return !existsSync(path.join(facts.root, ...artifact.path.split('/')))
  })
  const artifacts = rendered.map((artifact) =>
    classify(facts.root, artifact.path, artifact.content, artifact.managed, manifest?.files[artifact.path]?.hash),
  )
  return {
    root: facts.root,
    frameworkVersion,
    facts,
    artifacts,
    conflicts: artifacts.filter((artifact) => artifact.action === 'conflict').map((artifact) => artifact.path),
  }
}
