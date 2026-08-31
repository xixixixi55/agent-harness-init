## ADDED Requirements

### Requirement: Natural-language installation routing

The Bootstrap Skill MUST activate for requests to install, deploy, initialize,
adapt, update, diagnose, or remove Agent Harness Init.

#### Scenario: User requests installation in an existing project

- **WHEN** the user asks an Agent to install and adapt the Harness
- **THEN** the Agent performs read-only discovery and dry-run first
- **AND** it applies the deterministic CLI plan only within the authorized target

### Requirement: Authorization boundaries

The Bootstrap Skill MUST preserve the distinction between project-local writes,
global Skill installation, and external publication.

#### Scenario: Additional authority is required

- **WHEN** installation requires writing outside the target, overwriting a
  conflict, installing a global Skill, or creating a remote repository
- **THEN** the Agent obtains the required authorization before that action
