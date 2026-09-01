# Portable complete Harness architecture

## Why

Version 0.1 safely installs a small Agent operating contract, but it does not
carry a complete Harness governance architecture into target repositories.
Recording `workflow.provider: openspec` alone does not establish rule
precedence, project safety, architecture policy, Level 1/2/3 routing, change
artifacts, progressive context, verification, independent review, entropy
governance, or safe archive.

Users need the installed framework to preserve those behaviors across projects
and Agent providers, rather than merely documenting that OpenSpec exists.

## What changes

- Install a provider-neutral three-level workflow contract:
  - Level 1 for low-risk local changes without a change package.
  - Level 2 for formal behavior changes using tasks plus delta specs.
  - Level 3 for architectural/high-risk changes using proposal, specs, design,
    tasks, implementation, verification, independent review, and archive.
- Make progressive context loading, active-change association, risk-based
  verification, candidate freezing, and generator/evaluator separation part of
  the generated project Harness.
- Install generic rule precedence, expected-versus-actual fact sources,
  authorization boundaries, completion criteria, and configurable project
  architecture and repository-asset policy entry points.
- Generate focused propose, apply, fix, continue, status, verify,
  semantic-review, code-review, and archive Skills for Codex and Claude from one
  provider-neutral source model.
- Add deterministic workflow gates that validate level-specific artifacts,
  required task completion, delta-spec presence, and archive readiness without
  pretending to judge semantic correctness.
- Treat OpenSpec-compatible change artifacts as the Level 2/3 planning
  protocol. The external OpenSpec CLI remains optional; Agents must fall back to
  the same on-disk protocol when it is unavailable.
- Preserve existing project rules, custom verification commands, and managed
  file ownership during installation and upgrades.
- Add configurable named gates so each target project can connect its real
  architecture, asset, type, build, test, and documentation commands without
  inheriting commands or thresholds from the source application.
- Install entropy governance and iteration learning so archive synchronizes
  living specs, detects documentation/tool drift, records lessons, and surfaces
  reusable template candidates for explicit review.
- Replace README claims with an implementation-backed description and document
  the relationship between OpenSpec planning and Harness enforcement.

## Non-goals

- Copy domain-specific architecture, commands, file-size thresholds, or
  verification scripts from the source application into unrelated projects.
- Automatically determine business risk using filenames or lines changed.
- Claim that deterministic checks can prove requirement semantics or code
  correctness.
- Require a globally installed OpenSpec CLI or modify application dependencies.
- Automatically commit, push, publish, or archive without the authority and
  confirmations required by the target project.

## Capabilities

- `three-level-workflow-routing`
- `project-governance-foundation`
- `adaptive-architecture-and-assets`
- `openspec-harness-lifecycle`
- `verification-review-gates`
- `entropy-and-iteration-learning`
- `portable-workflow-installation`

## Impact

This is a Level 3 product and architecture change. It expands the generated
artifact set, public configuration contracts, CLI commands, provider Skills,
manifest ownership, lifecycle tests, README, and release behavior. Existing
0.1 installations must remain diagnosable and upgrade without overwriting
project-owned files. A minor-version npm release is expected after the change
is reviewed and explicitly authorized for publication.
