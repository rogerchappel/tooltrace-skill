export type EventKind = "message" | "command" | "tool" | "file" | "approval" | "error" | "retry" | "complete";
export type Risk = "info" | "approval" | "error";

export interface ToolEvent {
  kind: EventKind;
  title: string;
  timestamp?: string;
  tool?: string;
  command?: string;
  path?: string;
  status?: "ok" | "failed" | "pending";
  detail?: string;
}

export interface Finding {
  risk: Risk;
  code: string;
  message: string;
  title?: string;
}

export interface TraceSummary {
  source: string;
  generatedAt: string;
  total: number;
  counts: Record<EventKind, number>;
  tools: string[];
  commands: string[];
  files: string[];
  findings: Finding[];
  events: ToolEvent[];
}

