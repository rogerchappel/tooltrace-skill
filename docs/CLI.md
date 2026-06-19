# CLI Reference

## summarize

```bash
tooltrace-skill summarize examples/tool-events.jsonl --out TOOLTRACE.md
tooltrace-skill summarize examples/tool-events.jsonl --format json
```

Creates a proof summary from local JSONL events.

## check

```bash
tooltrace-skill check examples/tool-events.jsonl --fail-on approval
tooltrace-skill check examples/tool-events.jsonl --config examples/tooltrace-skill.config.json
```

Runs the same analysis and exits non-zero when findings meet the selected threshold.

