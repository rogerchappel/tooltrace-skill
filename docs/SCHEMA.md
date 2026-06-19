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

## Policy Config

`--config` accepts a small JSON file:

```json
{
  "failOn": "approval"
}
```

Allowed thresholds are `info`, `approval`, and `error`.
