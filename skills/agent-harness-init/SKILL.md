---
name: agent-harness-init
description: Install, deploy, initialize, adapt, update, diagnose, or remove Agent Harness Init in an existing or new software project. Use when a user asks to add Harness gates or make a project Agent-governed. Do not use for ordinary feature implementation after the Harness is installed.
---

# Agent Harness Init

Use the deterministic `agent-harness` CLI for discovery, planning, rendering,
hashing, and writes. Use Agent judgment only to validate detected project facts
and merge a minimal reference into an existing project-owned instruction file.

## Install or adapt

1. Resolve the exact target-project root and read its existing `AGENTS.md` or
   equivalent instructions. A request to install in the current project
   authorizes project-local Harness files, not global tools or external actions.
2. Run `agent-harness plan --root <root>` before any mutation. If the executable
   is unavailable, report the missing installation; do not silently install a
   global package. A user-approved ephemeral fallback is
   `npx agent-harness-init plan --root <root>`.
3. Validate the detected profile and commands against bounded project metadata
   such as `package.json`, `pyproject.toml`, workspace files, and CI entrypoints.
   Do not broadly read source contents merely to initialize the Harness.
4. If the plan reports any conflict, stop and explain the exact paths. Never use
   overwrite flags to bypass an unowned or modified file.
5. Apply with `agent-harness init --root <root> --yes`.
6. When a project-owned `AGENTS.md` already exists, preserve it and add only a
   concise reference to `AGENT_HARNESS.md` if no equivalent reference exists.
   Do not weaken or replace existing rules.
7. Run `agent-harness doctor --root <root>` and report the detected profile,
   generated files, preserved files, and diagnostic result. Do not run the
   project's full verification suite unless requested or needed for a separate
   implementation task.

For updates, uninstall, provider paths, conflict behavior, and authorization
boundaries, read [references/install-protocol.md](references/install-protocol.md).
