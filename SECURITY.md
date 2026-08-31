# Security policy

## Reporting

Please report path traversal, overwrite protection, manifest ownership,
transaction rollback, or command-execution vulnerabilities privately to the
repository owner before public disclosure.

Do not include private project source, credentials, home-directory contents, or
real case/customer data in a report. Use a minimal SYNTHETIC fixture.

## Trust boundaries

The CLI writes only after an explicit apply command. `verify` executes commands
from the target project's `harness.config.yaml`; treat that file as executable
project configuration and review changes before running it.
