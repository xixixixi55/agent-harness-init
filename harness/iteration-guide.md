# Portable Harness iteration guide

OpenSpec records what must change; Harness controls how work is routed, implemented, verified, reviewed, and archived.

## Levels

- Level 1: low-risk local work. No change package; use focused verification.
- Level 2: bounded formal behavior change. Require tasks plus delta specs, affected verification, semantic review, and spec sync.
- Level 3: architecture or high-risk change. Require proposal, specs, design, tasks, implementation, candidate freeze, semantic review, independent review, full gates, sync, and archive.

Choose levels from contracts, architecture, security, persistence, and rollback risk—not file count. Before creating Level 2/3 work, search active changes for the same capability, user outcome, scenario, call chain, or feedback lifecycle.

## Active-change association

Inspect `openspec/changes/` excluding `archive/`. Reuse an active change when it has the same formal capability, user outcome, acceptance scenario, core call chain, or pre-freeze feedback. A shared filename or keyword is discovery evidence, not sufficient association by itself. Never rewrite an archived change.

## Required artifacts

- Level 2: `tasks.md` with `workflow_level: 2` and at least one checklist task, plus one or more `specs/<capability>/spec.md` delta specs.
- Level 3: `proposal.md`, `design.md`, Level 3 `tasks.md`, delta specs, then `review.md` and `iteration.md` before archive.
- ADDED/MODIFIED Requirements need a Scenario containing WHEN and THEN. REMOVED Requirements need Reason and Migration. RENAMED sections need FROM and TO.

## Stage protocol

1. Propose: associate active work, choose the lowest justified level, state non-goals, and create only required artifacts.
2. Apply: select the first incomplete required task, read its relevant spec/design/source/tests, obtain a failing or discriminating check, implement, rerun focused evidence, and update the task plus evidence.
3. Verify: run `agent-harness gate --level <n> --stage verify --change <name>`, then the applicable named project gates from `harness.config.yaml`.
4. Review: compare implementation with every applicable Requirement/Scenario for completeness, correctness, and consistency. Record discrepancies rather than silently changing the spec.
5. Freeze: only after required tasks, acceptance, and focused evidence converge. Formal behavior or core implementation changes unfreeze the candidate and invalidate affected review evidence.
6. Archive: sync delta specs into living `openspec/specs/`, complete the strict review and iteration records, run the archive gate, request required human semantic confirmations, then move the change under `openspec/changes/archive/`.

Load context progressively: root rules first, then only the active stage's guide and change artifacts. OpenSpec CLI commands are optional; the on-disk artifact contract is not.
