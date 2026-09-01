# project-governance-foundation

## Purpose

Defines the current portable Harness behavior for project-governance-foundation.

## Requirements

### Requirement: Explicit rule precedence

The installed Harness MUST define project-owned root rules as higher priority
than generated Harness details and provider tool entry points.

#### Scenario: Existing rule is stricter

- **WHEN** an existing project rule is more restrictive than generated policy
- **THEN** the Agent follows the existing rule
- **AND** installation does not weaken or overwrite it

### Requirement: Behavior and implementation fact separation

The Harness MUST distinguish expected behavior from implementation facts and
MUST report material differences rather than assuming either is correct.

#### Scenario: Spec and runtime disagree

- **WHEN** a spec describes behavior that current code or tests do not exhibit
- **THEN** the Agent reports the difference and resolves it through the authorized change

### Requirement: Explicit authority boundaries

Project-local installation MUST NOT authorize global installation, destructive
actions, external services, Git mutation, credentials, or remote publication.

#### Scenario: Remote action is not authorized

- **WHEN** completion would require an unauthorized push or publication
- **THEN** the Agent stops before that action and requests authority

### Requirement: Evidence-based completion

Completion MUST depend on applicable architecture, verification, task, spec
sync, review, and acceptance evidence.

#### Scenario: Required evidence is missing

- **WHEN** implementation exists but an applicable gate remains open
- **THEN** the Agent does not claim completion

