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

## Status semantics

- An `approval` event with `status: "ok"` records a resolved approval and does not produce an `approval-requested` finding. Approvals with `status: "pending"` or no status remain unresolved findings.
- A `complete` event with `status: "failed"` records a `failed-event` finding and is not completion proof, so a trace without another non-failed `complete` event also reports `missing-completion-proof`.
- A `failed` status on any event produces a `failed-event` finding.

## Policy Config

`--config` accepts a small JSON file:

```json
{
  "failOn": "approval"
}
```

Allowed thresholds are `info`, `approval`, and `error`.
