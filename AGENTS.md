# AGENTS.md — Agent Harness Init

> This repository builds a provider-neutral Harness installer for AI-assisted software projects.

## Safety

- Never overwrite unowned project files silently.
- Installation must support a read-only plan before mutation.
- Generated files must be tracked in `.harness/manifest.json` with content hashes.
- Tests and examples must use SYNTHETIC/TEST/FIXTURE data only.
- Remote repository creation, publishing, and pushing require explicit user authorization.

## Architecture

Dependency direction: `types -> discovery -> planning -> rendering -> filesystem -> commands -> cli`.

- `src/types.ts`: public and internal contracts.
- `src/discovery.ts`: read-only target-project inspection.
- `src/planner.ts`: deterministic install/update planning.
- `src/render.ts`: project-local artifact rendering.
- `src/filesystem.ts`: guarded writes, manifests, and removal.
- `src/commands/`: CLI use cases.
- `src/cli.ts`: argument parsing and presentation only.

## Development

- TypeScript uses named exports and camelCase/PascalCase.
- Production source files should remain below 400 lines unless a cohesive module justifies more.
- Behavior changes require evidence proportionate to risk; safety boundaries and manifest ownership require automated regression tests.
- Run `npm test`, `npm run typecheck`, and `npm run build` before release.
- OpenSpec changes are the source of truth for formal product behavior.

## Attribution

This project is independent. Preserve the Harness-OSPX attribution and MIT notice in `README.md`, `THIRD_PARTY_NOTICES.md`, and `licenses/harness-ospx-MIT.txt` when distributing substantial derived material.
