# Iteration: portable-complete-harness

Archived: 2026-09-01
Workflow level: 3
Release candidate: agent-harness-init@0.2.0

## Overview

Delivered the complete provider-neutral Harness architecture: Level 1/2/3 routing, active-change association, OpenSpec-compatible artifacts, progressive context, task-driven implementation, engineering and semantic verification separation, independent review, candidate freeze, entropy gates, living-spec sync, archive evidence, and iteration learning.

## Problems encountered

- Prevented adoption or overwrite of unowned files, including identical content and project-owned configuration.
- Replaced guessed Python and project-specific commands with explicit configured gates.
- Hardened delta, task, review, iteration, provider mirror, Skill frontmatter, link, and path validation.
- Resolved OpenSpec's non-idempotent repeated ADDED sync by validating already-synced living specs and archiving with `--skip-specs`.

## Lessons

- Ownership is a first-class safety contract; matching content does not imply ownership.
- Structural evidence needs strict schemas and failure-closed parsing.
- Provider adapters should remain thin while executable policy lives in one shared protocol.
- Engineering gates, semantic review, and independent evaluation are complementary evidence.

## Harness feedback

- E-M1: root summary and detailed Harness guides are consistent.
- E-M2: no unresolved rule conflicts; user confirmed formal archive.
- E-M3: README version facts were updated before publication.
- E-M4: iteration lessons are recorded here and in the archived change.
- E-M5: no additional TEMPLATE_CANDIDATE beyond the explicitly implemented portable framework; user confirmed publication.
