# Release Candidate Notes

## Classification

Ship.

## Included

- Agent skill instructions in `SKILL.md`.
- Local-first TypeScript CLI.
- JSONL event parser and proof summary engine.
- Markdown and JSON reporters.
- Fixture-backed tests and smoke command.

## Verification Checklist

- `npm test` - pass
- `npm run check` - pass
- `npm run build` - pass
- `npm run smoke` - pass
- `bash scripts/validate.sh` - pass

## Release Candidate Result

The initial public build is ready for review. The package is classified as `ship` because it has a complete local-first CLI, reusable skill instructions, fixture-backed tests, smoke coverage, and documented approval boundaries.
