import { readFile } from "node:fs/promises";
import type { Risk } from "./types.js";

export interface ToolTraceConfig {
  failOn: Risk;
}

export async function readConfig(path: string | undefined): Promise<ToolTraceConfig> {
  if (!path) return { failOn: "error" };
  const raw = JSON.parse(await readFile(path, "utf8")) as Partial<ToolTraceConfig>;
  return {
    failOn: raw.failOn === "info" || raw.failOn === "approval" || raw.failOn === "error" ? raw.failOn : "error"
  };
}

