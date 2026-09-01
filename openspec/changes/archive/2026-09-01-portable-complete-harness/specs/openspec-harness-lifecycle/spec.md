## ADDED Requirements

### Requirement: OpenSpec-compatible planning artifacts

Level 2 and Level 3 work MUST use OpenSpec-compatible change artifacts even
when the external OpenSpec CLI is unavailable.

#### Scenario: Level 2 change is proposed

- **WHEN** an Agent creates a Level 2 change
- **THEN** the package contains `tasks.md` with `workflow_level: 2`
- **AND** at least one delta spec uses ADDED, MODIFIED, REMOVED, or RENAMED

#### Scenario: Level 3 change is proposed

- **WHEN** an Agent creates a Level 3 change
- **THEN** the package contains proposal, delta specs, design, and tasks
- **AND** every Requirement contains at least one observable Scenario

#### Scenario: OpenSpec executable is absent

- **WHEN** the host Agent cannot call an OpenSpec command
- **THEN** it creates and validates the same on-disk artifacts directly
- **AND** it does not downgrade or skip the required workflow

### Requirement: Task-driven implementation

Implementation MUST proceed from the active change task list and MUST record
risk-proportionate evidence before a required task is marked complete.

#### Scenario: Verification fails

- **WHEN** a task's applicable verification fails
- **THEN** the task remains incomplete
- **AND** the Agent diagnoses and reruns the focused failing check before wider gates

### Requirement: Spec synchronization before archive

Level 2 and Level 3 delta specs MUST be reconciled with implementation and
synced into living specs before formal archive.

#### Scenario: Delta remains unsynced

- **WHEN** an archive is requested while a delta has not been reconciled and synced
- **THEN** the archive gate fails
- **AND** the change remains active
