# three-level-workflow-routing

## Purpose

Defines the current portable Harness behavior for three-level-workflow-routing.

## Requirements

### Requirement: Risk-based three-level routing

The installed Harness MUST define Level 1, Level 2, and Level 3 workflows and
MUST route work using formal behavior, affected contracts, architecture,
security, persistence, and rollback risk rather than file count or line count.

#### Scenario: Low-risk local work

- **WHEN** a task changes documentation, presentation, internal structure, or
  restores existing behavior without changing a public contract
- **THEN** the Agent selects Level 1
- **AND** no OpenSpec change package is required
- **AND** verification remains proportional to the actual risk

#### Scenario: Bounded formal behavior change

- **WHEN** a task adds or modifies a formal Requirement or Scenario without a
  major architecture migration
- **THEN** the Agent selects Level 2
- **AND** it uses tasks plus at least one delta spec

#### Scenario: Architectural or high-risk change

- **WHEN** a task changes core architecture, a deployment or security model, a
  critical workflow, or has high rollback risk
- **THEN** the Agent selects Level 3
- **AND** it follows the complete proposal-through-archive lifecycle

### Requirement: Active-change association

Before creating a Level 2 or Level 3 package, the installed Harness MUST require
the Agent to search active changes and associate work by shared capability,
user outcome, acceptance scenario, core call chain, or feedback lifecycle.

#### Scenario: Existing change has the same outcome

- **WHEN** an active change covers the same formal capability and user outcome
- **THEN** the Agent continues that change instead of creating a duplicate

#### Scenario: Similar keyword has a different outcome

- **WHEN** an active change shares files or keywords but not the formal outcome
- **THEN** the Agent records why it is excluded and creates a separate change

### Requirement: Progressive context loading

The installed Harness MUST load only the rules and artifacts required by the
current level and lifecycle stage.

#### Scenario: Level 1 implementation

- **WHEN** an Agent performs Level 1 work
- **THEN** it reads root rules plus directly relevant source and tests
- **AND** it does not preload the complete Level 3 workflow

#### Scenario: Level 3 verification

- **WHEN** a Level 3 candidate reaches verification
- **THEN** the Agent loads the change specs, design, tasks, verification rules,
  and review rules required for that stage

