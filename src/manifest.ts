import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import type { HarnessManifest } from './types.js'

export const manifestRelativePath = '.harness/manifest.json'

export function loadManifest(root: string): HarnessManifest | undefined {
  const manifestPath = path.join(root, manifestRelativePath)
  if (!existsSync(manifestPath)) return undefined
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as HarnessManifest
  if (manifest?.schemaVersion !== 1 || manifest.framework?.name !== 'agent-harness-init') {
    throw new Error('Unsupported or invalid .harness/manifest.json')
  }
  return manifest
}

export function serializeManifest(manifest: HarnessManifest): string {
  return `${JSON.stringify(manifest, null, 2)}\n`
}
