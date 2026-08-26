# Tool Event Schema

Each JSONL line is one event.

## Required

| Field | Type | Description |
|---|---|---|
| `kind` | string | One of `message`, `command`, `tool`, `file`, `approval`, `error`, `retry`, `complete`. |
| `title` | string | Human-readable event label. |

## Optional

| Field | Type | Description |
|---|---|---|
| `timestamp` | string | ISO timestamp. |
| `tool` | string | Tool or connector name. |
| `command` | string | Shell or task command. |
| `path` | string | File path touched by the event. |
| `status` | string | `ok`, `failed`, or `pending`. |
| `detail` | string | Short detail for review. |

If `status` is present, it must exactly match one of the three allowed values. Unsupported strings and
non-string values are schema errors; they are not treated as an omitted status.

## Status semantics

- An `approval` event with `status: "ok"` records a resolved approval and does not produce an `approval-requested` finding. Approvals with `status: "pending"` or no status remain unresolved findings.
- A `complete` event is completion proof only when `status` is `"ok"` or omitted. A `pending` complete event is not proof and leaves `missing-completion-proof` in the report. A `failed` complete event additionally records a `failed-event` finding.
- A `failed` status on any event produces a `failed-event` finding.

## Policy Config

`--config` accepts a small JSON file:

```json
{
  "failOn": "approval"
}
```

Allowed thresholds are `info`, `approval`, and `error`.
The file must be valid JSON and `failOn` is required. Malformed JSON and unsupported or missing values
produce a configuration-file diagnostic and a non-zero exit; they are never replaced with a default.
