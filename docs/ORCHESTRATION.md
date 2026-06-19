# Orchestration

`tooltrace-skill` is a passive proof summarizer for agent activity.

## Flow

1. Capture or export local tool events as JSONL.
2. Run `tooltrace-skill summarize` to create review evidence.
3. Run `tooltrace-skill check` with the desired risk threshold.
4. Include the report in a PR, handoff, or approval request.

## Side Effects

The CLI reads the requested input file and writes only to `--out` when provided. It does not call tools, execute commands, approve actions, or contact networks.

