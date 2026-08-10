import { readFile } from "node:fs/promises";
import type { EventKind, ToolEvent } from "./types.js";

const KINDS = new Set<EventKind>(["message", "command", "tool", "file", "approval", "error", "retry", "complete"]);
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;

export function parseJsonl(text: string): ToolEvent[] {
  return text
    .split(/\r?\n/)
    .map((line, index) => ({ text: line.trim(), number: index + 1 }))
    .filter((line) => line.text !== "")
    .map((line) => normalize(parseLine(line.text, line.number), line.number));
}

export async function readEvents(path: string): Promise<ToolEvent[]> {
  return parseJsonl(await readFile(path, "utf8"));
}

function parseLine(text: string, line: number): unknown {
  try {
    return JSON.parse(text);
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Line ${line} contains invalid JSON: ${detail}`);
  }
}

function normalize(value: unknown, line: number): ToolEvent {
  if (!value || typeof value !== "object") {
    throw new Error(`Line ${line} is not a JSON object`);
  }
  const raw = value as Record<string, unknown>;
  if (!KINDS.has(raw.kind as EventKind)) {
    throw new Error(`Line ${line} has invalid kind`);
  }
  if (typeof raw.title !== "string" || raw.title.trim() === "") {
    throw new Error(`Line ${line} is missing title`);
  }
  const title = validatedString(raw.title, "title", line);
  return {
    kind: raw.kind as EventKind,
    title: title as string,
    timestamp: validatedString(raw.timestamp, "timestamp", line),
    tool: validatedString(raw.tool, "tool", line),
    command: validatedString(raw.command, "command", line),
    path: validatedString(raw.path, "path", line),
    status: raw.status === "ok" || raw.status === "failed" || raw.status === "pending" ? raw.status : undefined,
    detail: validatedString(raw.detail, "detail", line)
  };
}

function validatedString(value: unknown, field: string, line: number): string | undefined {
  if (typeof value !== "string" || value.trim() === "") return undefined;
  if (CONTROL_CHARACTERS.test(value)) {
    throw new Error(`Line ${line} field ${field} contains unsupported control characters`);
  }
  return value.trim();
}
