# Independent code review

Use an evaluator context independent from the implementing Agent. The evaluator reads project rules, architecture policy, specs, design, tests, and the candidate diff; it reports findings and MUST NOT modify files.

Level 1 does not require independent review. Level 2 uses it for public contracts, core data, security, or high-risk cross-module work. Level 3 uses it once after candidate freeze. Formal behavior or core-code changes invalidate affected review evidence.

The evaluator reports `ACCEPT` or `REJECT`, then MUST FIX findings with file/line evidence, WARNING findings, verification executed, and residual risks. The implementing Agent fixes findings, reruns affected evidence, freezes a new candidate, and requests a fresh independent review. Only a passing review may set `independent_review: passed` in the strict review record.
