---
name: agent-harness
description: Apply this project's Harness rules when implementing, fixing, reviewing, verifying, or planning changes in this repository.
---

Read `AGENT_HARNESS.md` and `harness.config.yaml`. Route work through the
portable Harness Level 1/2/3 contract, associate active changes, load context
progressively, preserve user changes, and collect risk-proportionate evidence.
Use `agent-harness status` and `agent-harness gate` for deterministic workflow
state; use `doctor` for managed-file drift and `verify` for configured project gates.
