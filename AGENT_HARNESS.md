# Agent Harness — agent-harness-init

This file is managed by Agent Harness Init. Project-owned rules in an existing
`AGENTS.md` or `CLAUDE.md` take precedence.

## Operating contract

- Rule precedence is project-owned root rules, then this summary, then focused Harness guides, then provider entry points.
- Inspect relevant source and tests before changing behavior.
- Keep changes inside the authorized project and preserve unrelated work.
- Treat requests/specs as expected behavior and code/Git/tests/builds as implementation facts; report material differences.
- Use commands declared in `harness.config.yaml`; do not invent replacements.
- Search active changes before creating Level 2/3 work and load only the current stage's context.
- Level 1 uses no change package. Level 2 requires tasks plus delta specs. Level 3 requires the complete proposal-through-archive lifecycle.
- Choose verification evidence according to risk. Security, persistence, public
  contracts, and critical transformations require automated regression evidence.
- Engineering verification does not replace semantic spec review. Applicable high-risk review uses an independent evaluator that never edits code.
- Completion requires applicable tasks, verification, acceptance, review, spec sync, and archive gates—not implementation alone.
- Never commit, push, publish, install global tooling, or contact external
  services unless the user authorizes that action.

## Project profile

- Profile: `javascript`
- Workflow: `openspec`

## Commands

- typecheck: `npm run typecheck`
- test: `npm run test`
- build: `npm run build`

Project-owned policy lives in `harness/project-architecture.md` and
`harness/repository-assets.md`. Lifecycle, verification, review, and entropy
guidance lives in the other `harness/` documents.
