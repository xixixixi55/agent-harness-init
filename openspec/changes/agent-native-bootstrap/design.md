# Design: Agent-native Harness bootstrap

## Architecture

```text
Bootstrap Skill -> CLI command -> read-only discovery -> deterministic plan
                                              |              |
                                              v              v
                                         project facts    dry-run report
                                                             |
                                                             v
                                      guarded filesystem <- render artifacts
                                                             |
                                                             v
                                                   manifest + diagnostics
```

The Skill supplies intent routing and safe operating instructions. The CLI owns
all deterministic discovery, path validation, rendering, hashing, and writes.

## Ownership model

`.harness/manifest.json` records the framework version and SHA-256 of every
managed file. A later update may replace a managed file only when its current
hash still matches the previous manifest. Modified or unowned destinations are
reported as conflicts and remain untouched.

## Installation transaction

Planning is read-only. Apply creates directories lazily, writes files through a
temporary sibling followed by rename, and writes the manifest last. A failed
apply removes files created by that incomplete transaction when their hashes
still match the planned content. It never deletes pre-existing content.

## Project adaptation

Discovery reads bounded metadata files and directory names; it does not scan
file contents broadly. Detected package scripts and ecosystem markers populate
`harness.config.yaml`. Unknown projects select `custom`, preserving explicit
TODO values rather than inventing commands.

## Provider adapters

The initial release generates repository-local Codex (`.agents`) and Claude
(`.claude`) Skills. The Bootstrap Skill can be installed globally for Codex or
Claude through explicit CLI flags. Other agents use `INSTALL_AGENT.md` and the
same CLI protocol.

## Alternatives

- Template-only repository: rejected because upgrades and ownership cannot be
  made safe or deterministic.
- Agent-written files without a CLI: rejected because results drift by provider
  and model.
- Runtime dependency on Harness-OSPX: rejected by the product independence goal.

## Rollout

Version 0.1 supports safe initialization, diagnostics, verification delegation,
Skill installation, update of untouched managed files, and uninstall of
untouched managed files. Publishing to npm can follow repository validation and
real-project trials.
