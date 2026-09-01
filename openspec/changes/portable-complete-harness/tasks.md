# Portable complete Harness architecture

workflow_level: 3
manual_acceptance: PASS — reviewed generated project instructions and SYNTHETIC Level 1/2/3 installation/gate transcripts.

## 1. Contracts and routing

- [x] T001 Extend contracts for Level 1/2/3, ordered named gates, project-owned policies, gate stages, structured findings, and review/sync evidence; verify with TypeScript and focused unit tests.
- [x] T002 Implement bounded active-change discovery, task/delta parsing, link and provider-mirror checks, and deterministic level/stage gate evaluation; verify malformed, incomplete, drifted, scoped, and archive-ready fixtures.

## 2. Portable workflow rendering

- [x] T003 Replace the minimal operating contract with generic precedence, fact sources, authority, safety, association, level routing, progressive context, verification, review, and completion rules; verify semantic renderer assertions.
- [x] T004 Generate iteration, verification, independent-review, entropy, OpenSpec, project-architecture, and repository-asset artifacts without source-application-specific data, paths, thresholds, or commands; verify project-owned versus managed lifecycle behavior.

## 3. Provider adapters

- [x] T005 Generate propose, apply, fix, continue, status, verify, semantic-review, code-review, and archive Skills for Codex and Claude from shared definitions; verify provider path metadata and mirror invariants.
- [x] T006 Update the Bootstrap Skill and `INSTALL_AGENT.md` so natural-language installation explains and verifies the complete Harness architecture instead of only running `doctor`.

## 4. CLI and lifecycle

- [x] T007 Add read-only `status` and `gate` CLI commands with stable exit codes and bounded output; verify argument, missing-change, incomplete-task, and ready-state behavior.
- [x] T008 Add backward-compatible named-gate execution and project-policy validation; verify ordered stop-on-failure behavior without inventing commands.
- [x] T009 Preserve 0.1 manifests, project-owned configuration/policies, modified managed files, and rollback behavior while adding the new artifact set; verify install, update, doctor, conflict, and uninstall regressions.

## 5. Entropy, archive, and learning

- [x] T010 Implement structural entropy checks for links, workflow metadata, required tasks, delta format, provider mirrors, sync declarations, and summary references; verify scoped and all-change behavior.
- [x] T011 Generate and validate archive/iteration-learning rules, including human confirmation boundaries for semantic rule conflicts and template candidates.

## 6. Documentation and acceptance

- [x] T012 Rewrite README around the complete implementation-backed Harness architecture, OpenSpec/Harness responsibility split, generated tools, adaptation points, examples, and limitations.
- [x] T013 Run SYNTHETIC end-to-end trials for generic project safety/architecture policy, Level 1 direct work, Level 2 delta workflow, and Level 3 frozen-candidate/archive workflow; manually review generated instructions and record evidence.

## 7. Freeze and release

- [x] T014 Freeze the candidate, run independent code review plus semantic spec review, fix findings, and invalidate/repeat affected evidence when formal behavior changes.
- [ ] T015 Run the scoped full release gate, validate and sync OpenSpec specs, archive the change, and prepare a minor npm release; publishing and remote release remain separately authorized external actions.

## Verification evidence

- `npm run verify`: PASS; TypeScript, 7 test files / 36 tests, and build.
- Ownership regression: PASS; project-owned config, architecture, asset, and OpenSpec policy remain outside the managed manifest and survive update.
- Workflow gates: PASS; Level 1 direct, Level 2 compact, Level 3 incomplete/archive-ready, malformed delta, link, summary, and provider-mirror fixtures.
- SYNTHETIC E2E: PASS; plan/init, doctor, status, Level 2 plan gate, Level 3 archive gate, and ordered named project gates.
- `openspec validate portable-complete-harness --type change --strict --no-interactive`: PASS.
- `openspec validate --specs --strict --no-interactive`: PASS; 7 living specs synced and valid.
- `npm run release:check`: PASS for `agent-harness-init@0.2.0`; 37-file dry-run tarball, no publication.
- Self-hosted install: PASS; conflict-free plan, install, doctor, and Level 3 verify gate.
