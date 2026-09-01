# Executable workflow protocols

These provider-neutral protocols are the behavioral source for every generated Codex and Claude Harness Skill.

## Harness propose

Read harness/iteration-guide.md. Inspect active changes, report association candidates and exclusions, choose the lowest justified level from contracts/risk, then create no package for Level 1, tasks+deltas for Level 2, or proposal+design+tasks+deltas for Level 3. Run the plan gate before implementation.

## Harness apply

Read harness/iteration-guide.md and harness/verification.md. Select the first incomplete required task; read only its relevant artifacts/source/tests; run a failing or discriminating check; implement within project architecture; rerun focused evidence; update the task and evidence without claiming unrelated completion.

## Harness fix

Reproduce first, distinguish expected behavior from implementation fact, associate active work, choose the justified level, add or update only evidence that distinguishes the regression, implement the smallest coherent fix, and rerun affected gates.

## Harness continue

Run agent-harness status, select the explicitly named or unambiguous active change, read its tasks and only the current-stage artifacts, then resume the first incomplete required task. Stop and report if multiple candidates remain materially ambiguous.

## Harness status

Run agent-harness status --root . and summarize each active change level and required-task progress. Inspect review/iteration evidence only when determining freeze or archive readiness; do not modify files.

## Harness verify

Read harness/verification.md. Run agent-harness gate for the current level/stage, then agent-harness verify for configured named project gates. Stop on the first failure, diagnose it, and report engineering evidence separately from semantic review.

## Harness semantic-review

Read the active delta/living specs, design, tasks, project architecture, implementation diff, and evidence. Map every Requirement and Scenario to observable implementation; report missing, incorrect, contradictory, or stale behavior. Do not treat passing tests as semantic proof and do not edit implementation during review.

## Harness code-review

Read harness/code-review-agent.md. Use an evaluator context independent from the implementer after candidate freeze. Require ACCEPT/REJECT, severity, file/line evidence, executed checks, and residual risk. The evaluator MUST NOT edit; formal fixes require a new frozen candidate and review.

## Harness archive

Read harness/entropy-rules.md. Confirm required tasks and acceptance, sync deltas into openspec/specs, complete review.md and Level 3 iteration.md from templates, obtain required human semantic confirmations, run the archive gate, then archive without rewriting prior archived changes.
