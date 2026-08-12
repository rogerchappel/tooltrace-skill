import { readFile } from "node:fs/promises";
import type { Risk } from "./types.js";

export interface ToolTraceConfig {
  failOn: Risk;
}

export async function readConfig(path: string | undefined): Promise<ToolTraceConfig> {
  if (!path) return { failOn: "error" };
  let raw: unknown;
  try {
    raw = JSON.parse(await readFile(path, "utf8"));
  } catch (error: unknown) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid configuration in ${path}: ${detail}`);
  }

  const failOn = typeof raw === "object" && raw !== null
    ? (raw as { failOn?: unknown }).failOn
    : undefined;
  if (failOn !== "info" && failOn !== "approval" && failOn !== "error") {
    throw new Error(
      `Invalid configuration in ${path}: failOn must be one of info, approval, or error`
    );
  }
  return { failOn };
}
