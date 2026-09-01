## ADDED Requirements

### Requirement: Level-specific engineering gates

The installed Harness MUST distinguish incremental verification from frozen
candidate verification and MUST NOT require the Level 3 full gate for every
development step.

#### Scenario: Level 1 completes

- **WHEN** Level 1 work is ready to finish
- **THEN** the Agent runs the smallest check that distinguishes the changed risk

#### Scenario: Level 2 completes

- **WHEN** Level 2 work is ready to finish
- **THEN** the Agent runs quick project gates, affected tests, and scoped strict
  workflow-document checks

#### Scenario: Level 3 development is in progress

- **WHEN** required tasks or feedback remain open
- **THEN** the Agent runs focused verification only
- **AND** does not claim that the candidate is frozen

#### Scenario: Level 3 candidate is frozen

- **WHEN** implementation, required tasks, and applicable acceptance have converged
- **THEN** the Agent performs semantic review, independent code review when
  applicable, and the scoped full engineering gate

### Requirement: Engineering and semantic verification separation

The installed Harness MUST treat command execution and structural checks as
engineering verification and requirement/design coverage as semantic review.

#### Scenario: Tests pass but a requirement is missing

- **WHEN** engineering commands pass but semantic review finds an unimplemented
  Requirement or Scenario
- **THEN** the candidate is not archive-ready

### Requirement: Generator and evaluator separation

For Level 3 and risk-justified Level 2 changes, code review MUST be performed by
an independent evaluator context that does not modify code.

#### Scenario: Independent review rejects the candidate

- **WHEN** the evaluator reports a must-fix issue
- **THEN** implementation resumes
- **AND** affected review evidence is invalidated before the candidate is frozen again

### Requirement: Deterministic archive readiness

The CLI MUST provide a read-only archive gate that checks required artifacts,
task completion, delta presence, and declared review evidence without claiming
to prove semantic correctness.

#### Scenario: Required task is incomplete

- **WHEN** an archive gate reads an unchecked required task
- **THEN** it exits non-zero and identifies that task

#### Scenario: All structural evidence is present

- **WHEN** all level-specific artifacts, tasks, deltas, sync declarations, and
  review declarations are present
- **THEN** the structural archive gate passes
- **AND** its output states that semantic correctness still depends on Agent review
