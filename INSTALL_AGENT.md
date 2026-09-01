# Installing Agent Harness with an AI agent

Ask your agent:

> Install and adapt Agent Harness Init to this project. Run a read-only plan
> first, preserve existing rules, apply only a conflict-free plan, then run
> doctor and report the result.

Deterministic protocol:

1. `agent-harness plan --root .`
2. Review detected commands and every conflict.
3. If conflict-free, run `agent-harness init --root . --yes`.
4. If an unowned `AGENTS.md` exists, inspect it and add only a reference to
   `AGENT_HARNESS.md` without weakening existing rules.
5. Run `agent-harness doctor --root .`.
6. Read the generated Level 1/2/3, OpenSpec, verification, review, architecture,
   asset, entropy, and archive policies and report any project-specific TODOs.

Do not authorize global Skill installation, repository creation, pushing, or
publishing merely from a project-local installation request.
