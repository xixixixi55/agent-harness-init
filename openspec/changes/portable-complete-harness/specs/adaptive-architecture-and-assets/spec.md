## ADDED Requirements

### Requirement: Project-owned architecture policy

The installer MUST provide a project-owned location for layer, dependency,
naming, size, directory, and test-placement rules without inventing domain
architecture from generic markers.

#### Scenario: Source roots are discovered

- **WHEN** installation detects source and test roots
- **THEN** it seeds only those factual paths
- **AND** leaves dependency directions and responsibilities for project ownership

### Requirement: Repository asset policy

The installer MUST provide a project-owned policy for canonical assets,
synthetic fixtures, generated outputs, and sensitive data.

#### Scenario: Generic fixture guidance is initialized

- **WHEN** the policy is created
- **THEN** fixtures require SYNTHETIC, TEST, or FIXTURE labeling
- **AND** no source-application business data or identifiers are copied

### Requirement: Backward-compatible named gates

The Harness MUST support ordered named project gates while continuing to load
version 0.1 lint, typecheck, test, and build commands.

#### Scenario: Legacy configuration is loaded

- **WHEN** a version 0.1 configuration contains only fixed commands
- **THEN** the verifier normalizes them into the ordered gate model
- **AND** preserves stop-on-first-failure behavior

#### Scenario: A policy gate is absent

- **WHEN** no executable command is configured for a policy category
- **THEN** Harness does not fabricate or silently pass a guessed command
