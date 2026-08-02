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

## Syntax and errors

The command must be `summarize` or `check` and must be followed by an events file. `--out`, `--format`,
`--fail-on`, and `--config` each require a value. Formats are limited to `markdown` and `json`, and fail
thresholds to `info`, `approval`, and `error`. Unknown commands, unknown options, unsupported values, and
missing values exit non-zero with a diagnostic. `tooltrace-skill --help` (or `help`) prints usage and exits 0.

Blank JSONL lines are ignored, but diagnostics always use physical line numbers from the input file. Both
schema validation failures and malformed JSON identify the affected line. For example, this input has a blank
first line and invalid JSON on line 3:

```bash
printf '\n{"kind":"complete","title":"Done"}\n{malformed}\n' > /tmp/tooltrace-invalid.jsonl
tooltrace-skill summarize /tmp/tooltrace-invalid.jsonl
# Line 3 contains invalid JSON: ...
```

The command exits non-zero and writes the single-line diagnostic to standard error.

Runs the same analysis and exits non-zero when findings meet the selected threshold.
