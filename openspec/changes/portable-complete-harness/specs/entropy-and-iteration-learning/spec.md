## ADDED Requirements

### Requirement: Structural entropy checks

Harness MUST provide scoped checks for relative links, workflow metadata,
required tasks, delta structure, provider mirrors, living-spec sync declarations,
and managed-summary references.

#### Scenario: One change is checked

- **WHEN** a scoped gate names one active change
- **THEN** other changes' task debt does not block it
- **AND** repository-wide link and provider drift remains visible

#### Scenario: Provider tools drift

- **WHEN** corresponding Codex and Claude tools differ semantically
- **THEN** the entropy gate fails and identifies the mismatch

### Requirement: Judgment remains explicit

Semantic rule conflicts and cross-project template-candidate decisions MUST
remain Agent analyses with human confirmation.

#### Scenario: Archive adds a governance rule

- **WHEN** a Level 3 archive adds a Harness rule
- **THEN** the Agent reports possible conflicts and waits for human confirmation

### Requirement: Iteration learning record

Every Level 3 archive MUST record outcomes, problems, lessons, project-Harness
updates, and reusable template candidates without exporting domain-specific data.

#### Scenario: Lesson is project-specific

- **WHEN** a lesson depends on one project's domain or tooling
- **THEN** it remains in that project's history and is not automatically templated

#### Scenario: Level 1 completes

- **WHEN** Level 1 work completes
- **THEN** no archive or iteration record is required
