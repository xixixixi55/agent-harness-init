# Reproducible SYNTHETIC acceptance

This acceptance uses only generated SYNTHETIC fixtures. It contains no data from the source application or any real project.

## Clean project

1. Create a temporary project with a `package.json` whose lint, typecheck, test, and build scripts exit successfully.
2. Run `node dist/cli.js plan --root <fixture>` and confirm no files were written.
3. Run `node dist/cli.js init --root <fixture> --yes`.
4. Run `node dist/cli.js doctor --root <fixture>` and require every managed artifact to be `OK`.
5. Confirm `harness.config.yaml`, `harness/project-architecture.md`, `harness/repository-assets.md`, and `openspec/config.yaml` are project-owned and absent from the managed manifest.

## Workflow gates

1. Level 1 plan/verify succeeds without a change package; Level 1 archive returns exit code 2.
2. Level 2 plan succeeds only with `workflow_level: 2`, at least one checklist task, and valid delta Requirements/Scenarios.
3. Level 3 archive remains blocked until tasks, strict review declarations, iteration learning, repository entropy, and provider parity converge.
4. An unsafe change name such as `../outside` returns exit code 2 without reading outside `openspec/changes/`.

## Engineering gates and compatibility

1. Named gates execute in declared order and stop at the first failure; legacy fixed commands remain supported.
2. A simulated 0.1 manifest retains ownership of a generated `AGENTS.md` after update.
3. Single-provider installs pass without requiring an unused provider mirror; dual-provider drift fails.
4. Existing project-owned policy files and modified managed files are never silently overwritten.

These cases are automated in `src/cli.test.ts`, `src/config.test.ts`, `src/lifecycle.test.ts`, `src/verify.test.ts`, and `src/workflow.test.ts`.
