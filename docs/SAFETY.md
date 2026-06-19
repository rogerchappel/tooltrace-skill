# Safety Notes

`tooltrace-skill` is passive evidence tooling.

## Allowed

- Read a specified JSONL event file.
- Write a report to `--out`.
- Exit non-zero based on findings.

## Not Allowed

- Run tools or commands.
- Approve requests.
- Upload logs.
- Merge, publish, deploy, or release.

## Review Guidance

Use `--fail-on approval` when any approval request should block unattended workflows. Use `--fail-on error` when only failed events should fail CI.

