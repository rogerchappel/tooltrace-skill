# ToolTrace Skill

Use this skill when an agent needs to explain tool activity in a compact, reviewable proof summary.

## When To Use

- Preparing proof for an agent-generated PR.
- Reviewing a connector or tool workflow before approval.
- Summarizing commands, file changes, errors, retries, and completion evidence.
- Turning raw JSONL activity into Markdown for human review.

## Required Inputs

- A local JSONL file with one tool event per line.
- Optional `--fail-on` threshold for `info`, `approval`, or `error`.

## Side-Effect Boundaries

This skill reads local files and can write a report to `--out`. It does not run tools, execute commands, call external APIs, approve actions, publish, merge, or release.

## Approval Requirements

Approval events in the log are evidence only. The skill must not treat them as permission to perform external actions. Follow the host agent's approval policy before any external write, account action, publish, deploy, or merge.

## Validation Workflow

1. Confirm the log path is local and intentionally provided.
2. Run `tooltrace-skill summarize <events.jsonl> --out TOOLTRACE.md`.
3. Run `tooltrace-skill check <events.jsonl> --fail-on approval`.
4. Review errors, approval requests, file changes, and missing completion proof.
5. Include the generated report and exact verification command results in the handoff.

## Examples

```bash
tooltrace-skill summarize examples/tool-events.jsonl --out TOOLTRACE.md
tooltrace-skill check examples/tool-events.jsonl --fail-on approval
tooltrace-skill summarize examples/tool-events.jsonl --format json
```

