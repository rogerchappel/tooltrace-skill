# ToolTrace Skill PRD

## Summary

`tooltrace-skill` converts local tool-call activity logs into reviewable proof summaries for agent apps, PR reviews, and supervised connector workflows.

## Problem

Raw tool logs are hard to review. Maintainers need to know which tools ran, which files changed, where commands failed, when approvals were required, and whether completion proof exists.

## Goals

- Parse JSONL tool events offline.
- Normalize commands, tool calls, file changes, approvals, errors, and completion proof.
- Emit stable Markdown and JSON reports.
- Fail checks when approval, error, or missing-proof findings meet the configured threshold.
- Provide reusable skill instructions and side-effect boundaries.

## Non-Goals

- Hosted trace storage.
- Autonomous approval decisions.
- Scraping arbitrary private logs.
- Replacing observability platforms.

## Acceptance Criteria

- Fixture-backed tests cover parsing, normalization, rendering, and thresholds.
- CLI smoke writes a Markdown proof report.
- README documents quickstart, schema, safety, and limitations.
- `SKILL.md` explains when agents should use the skill.

