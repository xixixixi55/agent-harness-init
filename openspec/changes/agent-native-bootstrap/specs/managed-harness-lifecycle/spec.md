## ADDED Requirements

### Requirement: Managed updates

The framework MUST update only files that remain identical to the hashes in the
installed manifest.

#### Scenario: User modified a generated file

- **WHEN** update finds a current hash different from the manifest
- **THEN** it reports the file as modified
- **AND** preserves the user's version

### Requirement: Diagnostics and verification delegation

The framework MUST diagnose installation integrity and run only commands
declared by project configuration.

#### Scenario: Doctor detects drift

- **WHEN** a managed file is missing or modified
- **THEN** doctor exits unsuccessfully and reports the affected relative path

#### Scenario: Verification is requested

- **WHEN** the project declares verification commands
- **THEN** the CLI runs them in order from the project root
- **AND** stops on the first non-zero exit

### Requirement: Safe uninstall

The framework MUST remove only unchanged managed files.

#### Scenario: Uninstall encounters a modified managed file

- **WHEN** its current hash differs from the installed manifest
- **THEN** uninstall preserves the file and reports it for manual handling
