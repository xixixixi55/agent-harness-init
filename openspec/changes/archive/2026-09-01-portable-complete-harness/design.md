# Design: Portable complete Harness architecture

## Source architecture and abstraction boundary

The source application combines a root rule entry point, detailed Harness
guides, OpenSpec change packages, task-driven development, engineering gates,
semantic review, independent code review, and entropy-aware archive. This
change extracts that control model while excluding application-specific layer
numbers, commands, document tooling, paths, and business rules.

The portable contract is:

```text
root project rules
        ↓
level routing + active-change association
        ↓
OpenSpec-compatible planning artifacts
        ↓
task-driven implementation with progressive context
        ↓
engineering verify ── semantic review ── independent code review
        ↓
candidate freeze + archive readiness gate
        ↓
spec sync + archive + iteration learning
```

## Governance foundation

The root project rules remain the highest project-owned authority. Generated
policy uses one explicit chain instead of duplicating rules in every tool:

```text
project-owned AGENTS.md / CLAUDE.md
        ↓
managed AGENT_HARNESS.md summary
        ↓
managed harness stage guides
        ↓
provider command and Skill entry points
```

Expected behavior comes from the current request, active change, and living
specs. Implementation facts come from code, Git state, tests, builds, and real
command output. The Agent reports disagreements instead of assuming either
source is automatically correct.

The generic contract also defines authorization boundaries for filesystem
scope, destructive actions, global installation, external services, Git
mutation, credentials, and remote publication. It contains no rules specific
to the source application's domain, data, documents, directories, or tools.

## Level model

The level is chosen from formal behavior, affected contracts, architectural
scope, security boundary, persistence impact, and rollback risk—not file count
or line count.

- **Level 1**: low-risk local changes, restoration of existing behavior,
  documentation, presentation, or internal refactoring. No change package.
- **Level 2**: new or modified formal Requirement/Scenario with bounded impact
  and no major architecture migration. Requires `workflow_level: 2`, tasks, and
  at least one delta spec.
- **Level 3**: architecture, core workflow, deployment/security model, broad
  migration, or high rollback risk. Requires proposal, specs, design, tasks,
  implementation, verification, semantic review, independent review when
  applicable, and archive.

Uncertainty alone does not escalate a task. The generated rules require the
Agent to use the lightest level justified by evidence and to explain material
assumptions.

## Planning protocol

Level 2 and 3 use OpenSpec-compatible files under
`openspec/changes/<change-name>/`. The package ships project-local format and
workflow rules, not the OpenSpec executable. When an OpenSpec command is
available, an Agent may use it; otherwise it creates and validates the same
files directly.

First installation creates an OpenSpec configuration only when it is absent.
An existing unowned configuration is preserved and reported or adapted by the
Agent under the normal conflict policy. Living specs are never fabricated from
directory names.

## Generated artifacts

The renderer will produce a coherent set from shared templates:

- `AGENT_HARNESS.md`: precedence, safety, change association, level routing,
  context loading, verification, review, and completion rules.
- `harness/iteration-guide.md`: portable Level 3 lifecycle.
- `harness/verification.md`: incremental versus frozen-candidate gates.
- `harness/code-review-agent.md`: independent evaluator protocol.
- `harness/entropy-rules.md`: task, spec, link, mirror, and archive checks.
- `harness/project-architecture.md`: project-owned layer, dependency, naming,
  size, directory, and test-placement policy seeded only with discovered facts.
- `harness/repository-assets.md`: project-owned canonical-asset, synthetic
  fixture, generated-output, and sensitive-data policy.
- `openspec/config.yaml`: compatible artifact rules when unowned and absent.
- Provider Skills: propose, apply, fix, continue, status, verify, review,
  code-review, and archive.

Codex and Claude artifacts are rendered from the same provider-neutral
definitions and tested for semantic mirroring. Provider adapters contain only
entry metadata and path conventions; workflow policy remains centralized.

## Deterministic gates

A new workflow-gate module reads only bounded Harness/OpenSpec metadata and
returns structured findings. It does not edit artifacts or infer whether code
satisfies a requirement.

Planned CLI surface:

```text
agent-harness status [--root PATH]
agent-harness gate --level 1|2|3 [--change NAME] --stage plan|verify|archive
```

Gate rules include:

- Level 1: no OpenSpec artifact requirement.
- Level 2 plan: tasks with `workflow_level: 2` and at least one delta spec.
- Level 3 plan: proposal, design, tasks, and at least one delta spec.
- Verify: required planning artifacts plus a well-formed task list.
- Archive: all required tasks complete, no missing delta, and recorded evidence
  for applicable semantic/engineering review gates.

Project commands remain in `harness.config.yaml`. `verify` continues to run
those commands; the generated verify Skill composes workflow gates with project
commands according to the selected level.

The configuration accepts backward-compatible ordered named gates, such as
architecture, assets, types, build, test, and docs. Existing fixed `lint`,
`typecheck`, `test`, and `build` commands normalize into that model. A missing
command remains explicitly unconfigured; the framework never invents one.

## Architecture and asset adaptation

The portable framework cannot know a target project's domain layers, file-size
policy, generated outputs, or canonical assets. It therefore initializes
project-owned policy documents and links them from the managed contract.
Discovery may seed factual source/test roots, while dependency directions,
thresholds, sensitive-data categories, and asset identities remain explicit
project choices.

Executable enforcement is connected through configured named gates. This
preserves the general "rules plus executable checks" architecture without
copying the source application's layer numbers, business paths, fixtures,
commands, or document rules.

## Candidate and review state

Human- and Agent-readable evidence remains in the change package instead of a
hidden database. `tasks.md` records task completion and verification evidence;
the generated workflow uses a small `review.md` for frozen-candidate semantic
and independent-review outcomes. Any subsequent formal behavior or core-code
change invalidates the relevant frozen review evidence.

The deterministic archive gate checks the presence and declared status of this
evidence. It does not certify that the reviewer was actually independent; the
Skill enforces evaluator separation through the host Agent's delegation tool.

## Entropy and iteration learning

Archive is a governance stage, not only a directory move. Deterministic entropy
checks cover relative links, required tasks, workflow metadata, delta structure,
provider mirrors, living-spec sync declarations, and summary references.
Semantic rule conflicts and cross-project template value remain Agent analyses
requiring human confirmation.

Each Level 3 archive records outcomes, problems, lessons, project-Harness
updates, and possible template candidates. Level 2 synchronizes its delta but
does not inherit the complete Level 3 ceremony. Level 1 creates no archive.

## Compatibility and ownership

The existing manifest and conflict rules remain authoritative. New managed
files are created only when absent. Existing user-owned Harness/OpenSpec files
become conflicts rather than overwrite targets. Existing schema-version-1
configuration remains loadable; new workflow fields are optional and defaults
come from the portable contract.

`harness.config.yaml` remains project-owned and excluded from managed-file
updates. Existing installations can update generated policy files without
losing project-specific commands.

## Testing strategy

- Unit tests for level/stage artifact requirements and task parsing.
- Renderer tests for all workflow documents and provider-mirror invariants.
- Lifecycle regressions for existing 0.1 manifests, user-modified files, and
  unowned OpenSpec configurations.
- CLI tests for status and gate exit codes.
- SYNTHETIC end-to-end projects covering Level 1, Level 2, Level 3, conflict,
  frozen review, and archive-ready paths.

## Alternatives

- Documentation-only workflow: rejected because it cannot enforce artifact and
  task gates.
- Require OpenSpec globally: rejected because installation must remain portable
  and must not gain global-install authority.
- Copy the source application's Harness directory verbatim: rejected because it
  would leak domain-specific commands and architecture into unrelated projects.
- One universal full gate: rejected because it makes low-risk work expensive
  and encourages users or Agents to bypass the Harness.
