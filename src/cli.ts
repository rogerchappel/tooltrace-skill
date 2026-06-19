#!/usr/bin/env node
import { writeFile } from "node:fs/promises";
import { summarize, shouldFail } from "./analyze.js";
import { readConfig } from "./config.js";
import { readEvents } from "./parser.js";
import { renderJson, renderMarkdown } from "./render.js";
import type { Risk } from "./types.js";

interface Args {
  command: "summarize" | "check" | "help";
  input?: string;
  out?: string;
  format: "markdown" | "json";
  failOn?: Risk;
  config?: string;
}

function parseArgs(argv: string[]): Args {
  const [command = "help", input, ...rest] = argv;
  const args: Args = {
    command: command === "summarize" || command === "check" ? command : "help",
    input,
    format: "markdown"
  };

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
    if (arg === "--out") args.out = rest[++index];
    else if (arg === "--format") args.format = rest[++index] === "json" ? "json" : "markdown";
    else if (arg === "--fail-on") args.failOn = parseRisk(rest[++index]);
    else if (arg === "--config") args.config = rest[++index];
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

function parseRisk(value: string | undefined): Risk {
  if (value === "info" || value === "approval" || value === "error") return value;
  throw new Error(`Invalid risk threshold: ${value}`);
}

function help(): string {
  return `tooltrace-skill

Usage:
  tooltrace-skill summarize <events.jsonl> [--out TOOLTRACE.md] [--format markdown|json]
  tooltrace-skill check <events.jsonl> [--fail-on approval] [--config .tooltrace-skill.json]
`;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.command === "help" || !args.input) {
    process.stdout.write(help());
    process.exitCode = args.command === "help" ? 0 : 1;
    return;
  }

  const events = await readEvents(args.input);
  const config = await readConfig(args.config);
  const summary = summarize(args.input, events);
  const output = args.format === "json" ? renderJson(summary) : renderMarkdown(summary);
  if (args.out) {
    await writeFile(args.out, output);
  } else {
    process.stdout.write(output);
  }

  if (args.command === "check" && shouldFail(summary.findings, args.failOn ?? config.failOn)) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
