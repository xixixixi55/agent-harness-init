# Agent-native Harness bootstrap

## Why

Users should be able to open an existing project and ask an AI coding agent to
install a Harness in natural language. The framework must adapt to the project
without depending on Harness-OSPX at runtime and without silently overwriting
project-owned files.

## What changes

- Add a provider-neutral CLI for discovery, planning, initialization, updates,
  diagnostics, verification, Bootstrap Skill installation, and uninstall.
- Add a small installable Bootstrap Skill that routes natural-language install
  requests to the deterministic CLI.
- Generate project-local rules, provider adapters, configuration, and an
  ownership manifest from detected project facts.
- Provide built-in JavaScript/TypeScript, Python, full-stack, monorepo, and
  custom fallback profiles.
- Publish independent documentation, licensing, and third-party attribution.

## Non-goals

- Automatically understand every framework or business architecture.
- Modify application source code during Harness installation.
- Upload, index, or transmit target-project source code.
- Silently merge an existing unowned `AGENTS.md`.
- Require OpenSpec; it remains an optional workflow profile.
- Claim affiliation with Harness-OSPX.

## Capabilities

- `safe-project-bootstrap`
- `agent-bootstrap-skill`
- `managed-harness-lifecycle`

## Impact

This is a new standalone Node.js package and repository. It creates governance
artifacts inside user-selected projects and optionally installs a discovery
Skill in supported agent home directories. File ownership and external writes
are explicit security boundaries.
