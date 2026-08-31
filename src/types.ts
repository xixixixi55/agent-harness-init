export type ProjectProfile = 'javascript' | 'python' | 'fullstack' | 'monorepo' | 'custom'
export type AgentProvider = 'codex' | 'claude'

export interface ProjectCommands {
  build?: string
  typecheck?: string
  lint?: string
  test?: string
}

export interface ProjectFacts {
  root: string
  name: string
  profile: ProjectProfile
  markers: string[]
  sourceRoots: string[]
  testRoots: string[]
  commands: ProjectCommands
  packageManager?: string
  gitDirty: boolean | null
  existingAgentFiles: string[]
}

export interface HarnessConfig {
  schemaVersion: 1
  project: { name: string; profile: ProjectProfile }
  agents: AgentProvider[]
  workflow: { provider: 'native' | 'openspec' }
  architecture: { sourceRoots: string[]; testRoots: string[] }
  commands: ProjectCommands
}

export interface RenderedArtifact { path: string; content: string }
export type PlanAction = 'create' | 'update' | 'unchanged' | 'conflict'

export interface PlannedArtifact extends RenderedArtifact {
  action: PlanAction
  reason: string
  previousHash?: string
  nextHash: string
}

export interface InstallPlan {
  root: string
  frameworkVersion: string
  facts: ProjectFacts
  artifacts: PlannedArtifact[]
  conflicts: string[]
}

export interface ManifestEntry { hash: string }

export interface HarnessManifest {
  schemaVersion: 1
  framework: { name: 'agent-harness-init'; version: string }
  installedAt: string
  files: Record<string, ManifestEntry>
}

export interface DoctorFinding {
  path: string
  status: 'ok' | 'missing' | 'modified'
}
