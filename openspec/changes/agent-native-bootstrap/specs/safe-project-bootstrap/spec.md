## ADDED Requirements

### Requirement: Read-only project discovery

The installer MUST derive project facts without modifying application source or
transmitting project contents.

#### Scenario: Existing project is inspected

- **WHEN** a user or Agent requests an installation plan
- **THEN** the installer detects supported ecosystem markers, package scripts,
  source roots, test roots, existing Agent files, and Git state
- **AND** no project file is written

### Requirement: Conflict-safe installation

The installer MUST NOT silently overwrite an unowned or user-modified file.

#### Scenario: Destination already exists

- **WHEN** a planned destination exists without a matching managed-file hash
- **THEN** the plan reports a conflict
- **AND** apply leaves that destination unchanged

#### Scenario: Clean target is applied

- **WHEN** a plan contains no conflicts and apply is authorized
- **THEN** generated artifacts are written atomically
- **AND** `.harness/manifest.json` records their hashes and framework version

### Requirement: Configurable adaptation

The installer MUST represent detected commands and architecture in project-local
configuration rather than framework source code.

#### Scenario: Unknown project type

- **WHEN** no built-in profile matches the target
- **THEN** the custom profile is selected
- **AND** unknown commands remain explicit TODO values rather than fabricated
