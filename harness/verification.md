# Verification strategy

Run the smallest evidence that distinguishes the changed risk, then broaden only
when the change crosses contracts or release boundaries.

The CLI runs only commands declared in `harness.config.yaml`:

- typecheck: `npm run typecheck`
- test: `npm run test`
- build: `npm run build`

Passing output is summarized. On failure, stop after the first failing command,
inspect that failure, and do not hide unrelated baseline failures.

Level 1 runs the smallest evidence that distinguishes the changed risk. Level 2
adds affected project commands, semantic review, scoped workflow gates, and spec
sync. Level 3 runs focused checks during development; only a converged frozen
candidate receives final semantic review, independent review, and full gates.
