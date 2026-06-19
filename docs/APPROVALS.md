# Approval Findings

Approval events represent requests, not granted permission.

## Recommended Thresholds

- Use `--fail-on error` for passive review summaries.
- Use `--fail-on approval` when an agent should stop before external action.
- Use `--fail-on info` only when every finding should block.

## Required Human Review

Human review is required before publishing, deploying, merging, sending messages, changing external account state, or running commands that mutate remote systems.

