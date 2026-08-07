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
  const [command, input, ...rest] = argv;
  if (command === "help" || command === "--help") {
    if (argv.length !== 1) throw new Error("Help does not accept additional arguments");
    return { command: "help", format: "markdown" };
  }
  if (command !== "summarize" && command !== "check") {
    throw new Error(command ? `Unknown command: ${command}` : "Missing command. Use --help for usage.");
  }
  if (!input || input.startsWith("--")) {
    throw new Error(`Missing events file for ${command}`);
  }
  const args: Args = {
    command,
    input,
    format: "markdown"
  };

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
    if (arg === "--out") {
      requireCommandOption(command, arg, "summarize");
      args.out = optionValue(rest, ++index, arg);
    } else if (arg === "--format") {
      requireCommandOption(command, arg, "summarize");
      args.format = parseFormat(optionValue(rest, ++index, arg));
    } else if (arg === "--fail-on") {
      requireCommandOption(command, arg, "check");
      args.failOn = parseRisk(optionValue(rest, ++index, arg));
    } else if (arg === "--config") {
      requireCommandOption(command, arg, "check");
      args.config = optionValue(rest, ++index, arg);
    }
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

function requireCommandOption(
  command: "summarize" | "check",
  option: string,
  allowedCommand: "summarize" | "check"
): void {
  if (command !== allowedCommand) throw new Error(`${option} is not valid for ${command}`);
}

function optionValue(args: string[], index: number, option: string): string {
  const value = args[index];
  if (!value || value.startsWith("--")) throw new Error(`Missing value for ${option}`);
  return value;
}

function parseFormat(value: string): "markdown" | "json" {
  if (value === "markdown" || value === "json") return value;
  throw new Error(`Unsupported format: ${value}. Expected markdown or json.`);
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
  if (args.command === "help") {
    process.stdout.write(help());
    return;
  }
  if (!args.input) throw new Error("Missing events file");

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
