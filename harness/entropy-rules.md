# Harness entropy and archive rules

Deterministic gates check relative links, workflow level, required tasks, delta structure, provider mirrors, sync declarations, and summary references. Semantic rule conflicts and template-candidate value require Agent analysis and human confirmation.

Level 1 has no archive. Level 2 reconciles and syncs delta specs. Level 3 additionally freezes the candidate, records reviews, synchronizes living specs, archives the change, and writes an iteration record.

## Strict review record

Create `review.md` from `harness/templates/review.md`. Fields are unique, line-anchored declarations. Level 2 independent review is `passed` or `not_applicable`; the latter requires a concrete reason. Level 3 independent review must be `passed`. Conflicting or duplicate declarations fail closed.

## Iteration learning

Create Level 3 `iteration.md` from `harness/templates/iteration.md`. Record non-empty Outcomes, Problems, Lessons, Project Harness Updates, and Template Candidates. “None” is an explicit decision; a reusable template candidate still requires human confirmation before changing this framework.

Before archive, run `agent-harness gate --level <n> --stage archive --change <name>`. Archive only after it passes and required human confirmations are recorded.
