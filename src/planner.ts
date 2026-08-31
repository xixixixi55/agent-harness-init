import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { configFromFacts, loadConfig } from './config.js'
import { discoverProject } from './discovery.js'
import { sha256 } from './hash.js'
import { loadManifest } from './manifest.js'
import { renderArtifacts } from './render.js'
import type { AgentProvider, InstallPlan, PlannedArtifact } from './types.js'

function classify(root: string, pathValue: string, content: string, managedHash?: string): PlannedArtifact {
  const target = path.join(root, ...pathValue.split('/'))
  const nextHash = sha256(content)
  if (!existsSync(target)) {
    return { path: pathValue, content, action: 'create', reason: 'destination is absent', nextHash }
  }
  const currentHash = sha256(readFileSync(target))
  if (currentHash === nextHash) {
    return { path: pathValue, content, action: 'unchanged', reason: 'content already matches', nextHash, previousHash: currentHash }
  }
  if (managedHash && currentHash === managedHash) {
    return { path: pathValue, content, action: 'update', reason: 'unchanged managed file can be updated', nextHash, previousHash: currentHash }
  }
  return { path: pathValue, content, action: 'conflict', reason: 'destination is unowned or was modified', nextHash, previousHash: currentHash }
}

export function createInstallPlan(
  root: string,
  frameworkVersion: string,
  agents: AgentProvider[] = ['codex', 'claude'],
): InstallPlan {
  const facts = discoverProject(root)
  const manifest = loadManifest(facts.root)
  const config = manifest ? loadConfig(facts.root) : configFromFacts(facts, agents)
  const rendered = renderArtifacts(facts, config).filter((artifact) => !manifest || artifact.path !== 'harness.config.yaml')
  const artifacts = rendered.map((artifact) =>
    classify(facts.root, artifact.path, artifact.content, manifest?.files[artifact.path]?.hash),
  )
  return {
    root: facts.root,
    frameworkVersion,
    facts,
    artifacts,
    conflicts: artifacts.filter((artifact) => artifact.action === 'conflict').map((artifact) => artifact.path),
  }
}
