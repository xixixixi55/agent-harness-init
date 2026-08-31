## ADDED Requirements

### Requirement: Public source distribution

The project MUST make its source repository publicly readable while preserving
its independent identity, MIT license, security policy, and Harness-OSPX notice.

#### Scenario: Anonymous user visits the repository

- **WHEN** the repository URL is accessed without owner credentials
- **THEN** the source, README, license, security policy, and third-party notice are publicly readable

### Requirement: Public npm distribution

The project MUST publish its CLI as the public npm package `agent-harness-init`
from the official npm registry with repository and issue metadata.

#### Scenario: User installs without cloning the repository

- **WHEN** the user runs `npx agent-harness-init plan --root <project>`
- **THEN** npm resolves the public package and invokes the `agent-harness` CLI
- **AND** the plan remains read-only

#### Scenario: Maintainer prepares a release

- **WHEN** a new package version is published
- **THEN** typecheck, tests, build, and package-content checks run before publication
- **AND** publication uses public access and the official npm registry

### Requirement: Reproducible release automation

The repository MUST verify supported Node.js versions in CI and provide an
explicit npm release workflow that requires repository-owned npm credentials.

#### Scenario: Release credentials are absent

- **WHEN** ordinary CI runs without an npm publishing credential
- **THEN** validation still completes without attempting publication
- **AND** no credential is embedded in source, package contents, or logs
