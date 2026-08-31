# Agent-native Harness bootstrap

workflow_level: 3
manual_acceptance: N/A (CLI、Markdown 与确定性安装文件，无 UI、真实文档或外部业务流程)

## 1. Contracts and discovery

- [x] T001 Define configuration, project-fact, plan, and manifest contracts; verify with TypeScript.
- [x] T002 Implement bounded project discovery and profile selection; verify with synthetic fixture tests.

## 2. Planning, rendering, and filesystem safety

- [x] T003 Implement deterministic artifact rendering and config serialization; verify snapshots by semantic assertions.
- [x] T004 Implement conflict detection, SHA-256 ownership, atomic writes, rollback, update, and safe uninstall; verify safety regressions using temporary fixtures.

## 3. CLI use cases

- [x] T005 Implement `init`, `plan`, `doctor`, `verify`, `update`, `uninstall`, and `install-skill`; verify argument and exit-code behavior.
- [x] T006 Add Codex and Claude project adapters plus provider-neutral `INSTALL_AGENT.md`; verify generated discovery paths.

## 4. Bootstrap Skill

- [x] T007 Create the natural-language Bootstrap Skill and focused installation reference; validate with the Codex Skill validator.

## 5. Distribution and documentation

- [x] T008 Write README onboarding, threat model, compatibility boundaries, independent identity, and Harness-OSPX attribution.
- [x] T009 Add MIT license, third-party notices, package metadata, and npm distribution metadata.

## 6. Verification and release

- [x] T010 Run typecheck, tests, build, packaged-CLI smoke tests, Skill validation, and clean-target/conflict-target end-to-end trials.
- [x] T011 Perform manual review of generated project instructions and dry-run output, then freeze the release candidate.
- [x] T012 Initialize Git, create the remote repository, push the verified initial version, and record the resulting URL.

## Verification evidence

- `npm run typecheck`: PASS.
- `npm test`: PASS, 3 files / 10 tests using SYNTHETIC temporary projects.
- `npm run build`: PASS.
- `openspec validate agent-native-bootstrap --type change --strict --no-interactive`: PASS.
- Bootstrap Skill source and installed copy: `quick_validate.py` PASS.
- CLI E2E: plan, init, doctor, configured typecheck/test, and temporary Codex Skill installation PASS.
- `npm pack --dry-run`: PASS, 34 packaged files; package audit reports 0 vulnerabilities.
- Cross-platform lockfile: official npm registry, 26 esbuild platform entries, no local mirror URLs.
- GitHub: private repository created at `https://github.com/xixixixi55/agent-harness-init`; verified `main` pushed and configured to track `origin/main`.

## 7. Public distribution follow-up

- [x] T013 Change the GitHub repository visibility to public and verify anonymous metadata access.
- [x] T014 Add npm registry metadata, public `publishConfig`, release checks, CI, and release automation; verify package metadata and workflow syntax.
- [x] T015 Update README for direct `npx agent-harness-init` installation and maintainer publishing; preserve independent identity and third-party notices.
- [ ] T016 Run the frozen release gates, publish `agent-harness-init@0.1.0` publicly, verify registry metadata and a clean external `npx` smoke test, then push release evidence.

### Public distribution evidence

- GitHub API update returned `visibility=public`; an unauthenticated repository-page request returned HTTP 200 with `logged_in=no`.
- `npm view agent-harness-init` returned 404 before publication, confirming the unscoped package name was available.
- `npm pkg get` confirms official repository/homepage/issues metadata and `publishConfig.access=public` with `https://registry.npmjs.org/`.
- Node 20/22 CI and release-triggered npm publishing workflows parse as valid YAML; publishing requires the repository-owned `NPM_TOKEN` secret.
- `npm run release:check`: PASS, including 3 test files / 10 tests and a 34-file public tarball preview.
- `npm publish --dry-run --access public`: PASS; target is npm `latest` with public access. Actual publication remains pending npm authentication.
