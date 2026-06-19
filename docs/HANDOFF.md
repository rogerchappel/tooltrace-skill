# Handoff Pattern

Use this pattern when an agent needs to make tool activity legible to a reviewer.

## Recommended Steps

1. Generate a proof summary from the local event log.
2. Run `check` with `--fail-on approval` for unattended workflows.
3. Review approval requests, errors, file changes, and commands.
4. Explain every finding before asking for trust or external action.
5. Include the report path and exact verification commands in the final handoff.

## Suggested PR Section

```markdown
## Tool Activity

- Commands: `npm test`, `npm run smoke`
- Tools: `file_fetch`
- Files: `README.md`
- Findings: approval requested for publish action
```

