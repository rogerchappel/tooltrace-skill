# tooltrace-skill

`tooltrace-skill` is a local-first agent skill and CLI for turning tool-call JSONL logs into proof summaries. It helps reviewers see tools, commands, files, approvals, failures, and completion evidence without reading raw traces.

## Quickstart

```bash
npm install
npm run build
node dist/src/cli.js summarize examples/tool-events.jsonl --out TOOLTRACE.md
node dist/src/cli.js check examples/clean-events.jsonl --fail-on approval
```

## CLI

```bash
tooltrace-skill summarize <events.jsonl> [--out TOOLTRACE.md] [--format markdown|json]
tooltrace-skill check <events.jsonl> [--fail-on info|approval|error]
```

`summarize` writes a Markdown or JSON report. `check` exits non-zero when findings meet the configured threshold.

## Safety Model

- No tool execution.
- No network calls.
- No telemetry.
- No approval decisions.
- No external account writes.
- Writes only to `--out` when requested.

## Limitations

- V1 expects normalized JSONL events.
- It summarizes proof; it does not verify whether external systems changed.
- Approval events are treated as review findings, not permission.

## Verification

```bash
npm test
npm run check
npm run build
npm run smoke
bash scripts/validate.sh
```

