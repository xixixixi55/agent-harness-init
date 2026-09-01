# portable-workflow-installation

## Purpose

Defines the current portable Harness behavior for portable-workflow-installation.

## Requirements

### Requirement: Portable workflow artifact installation

The installer MUST generate the complete generic governance foundation,
three-level workflow, verification strategy, independent-review protocol,
entropy rules, project-owned architecture and asset policies, and
OpenSpec-compatible configuration without copying source-application rules.

#### Scenario: Clean project is initialized

- **WHEN** a conflict-free installation is authorized
- **THEN** all portable workflow documents and configured provider Skills are created
- **AND** the manifest records every managed workflow artifact

#### Scenario: Project owns an OpenSpec configuration

- **WHEN** the target already contains an unowned `openspec/config.yaml`
- **THEN** the installer preserves it
- **AND** the plan reports any incompatible managed destination as a conflict

### Requirement: Provider workflow parity

Codex and Claude adapters MUST expose the same propose, apply, fix, continue,
status, verify, semantic-review, code-review, and archive policy from shared
provider-neutral definitions.

#### Scenario: Both providers are enabled

- **WHEN** the installer renders project Skills for Codex and Claude
- **THEN** their workflow semantics are equivalent
- **AND** provider-specific files contain only metadata and path adaptations

### Requirement: Backward-compatible managed updates

Existing version 0.1 installations MUST remain diagnosable and MUST gain new
managed workflow files only through conflict-safe update behavior.

#### Scenario: Existing managed file was modified

- **WHEN** update finds a generated 0.1 file whose hash differs from its manifest
- **THEN** it reports a conflict and preserves the file

#### Scenario: Existing project configuration is customized

- **WHEN** an existing installation has a project-owned `harness.config.yaml`
- **THEN** update preserves that configuration
- **AND** new workflow defaults remain compatible when optional fields are absent

