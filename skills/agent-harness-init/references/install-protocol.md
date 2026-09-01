# Installation protocol

## Update

Run a plan first, then `agent-harness update --root <root> --yes` only when no
conflicts exist. Updates may replace files only when their current SHA-256 still
matches `.harness/manifest.json`. Preserve modified managed files and report them.

## Diagnose

`agent-harness doctor --root <root>` returns non-zero when a managed file is
missing or modified. Treat this as project drift, not permission to restore it.

## Verify

`agent-harness verify --root <root>` executes only commands declared in
`harness.config.yaml`, stops at the first failure, and may be expensive. Use it
when the user asks for gates or when implementation completion requires them.

`agent-harness status --root <root>` reports active change levels and task
progress. `agent-harness gate --level <1|2|3> --stage <plan|verify|archive>
--change <name>` checks deterministic workflow structure. Gate success does not
replace semantic requirement review.

## Project-owned adaptation

`harness.config.yaml`, `harness/project-architecture.md`, and
`harness/repository-assets.md` are initialized once and remain project-owned.
Adapt them to the target project's real commands, dependency directions,
fixtures, generated outputs, and sensitive-data boundaries. Never fill them
with rules copied from an unrelated source project.

## Uninstall

Run doctor first. `agent-harness uninstall --root <root> --yes` removes only
unchanged managed files. It preserves modified or missing entries for manual
resolution. Do not delete an existing project-owned `AGENTS.md` reference until
the managed sidecar has been removed and the user wants full cleanup.

## Global Bootstrap Skill

Installing a global Skill is a separate mutation outside the target project:

```text
agent-harness install-skill --provider codex
agent-harness install-skill --provider claude
```

Require explicit authorization for that scope. Existing destinations are not
overwritten unless the user reviews and explicitly requests `--force`.

## External boundaries

A local Harness installation never authorizes Git commits, pushes, remote
repository creation, package publication, telemetry, uploads, or network access.
Obtain separate authorization when those actions are needed.
