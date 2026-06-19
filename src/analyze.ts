import type { EventKind, Finding, Risk, ToolEvent, TraceSummary } from "./types.js";

const RISK_ORDER: Record<Risk, number> = {
  info: 0,
  approval: 1,
  error: 2
};

const EVENT_KINDS: EventKind[] = ["message", "command", "tool", "file", "approval", "error", "retry", "complete"];

export function shouldFail(findings: Finding[], failOn: Risk): boolean {
  return findings.some((finding) => RISK_ORDER[finding.risk] >= RISK_ORDER[failOn]);
}

export function summarize(source: string, events: ToolEvent[]): TraceSummary {
  const findings: Finding[] = [];
  const counts = Object.fromEntries(EVENT_KINDS.map((kind) => [kind, 0])) as Record<EventKind, number>;

  for (const event of events) {
    counts[event.kind] += 1;
    if (event.kind === "approval") {
      findings.push({ risk: "approval", code: "approval-requested", message: "Tool flow requested approval", title: event.title });
    }
    if (event.kind === "error" || event.status === "failed") {
      findings.push({ risk: "error", code: "failed-event", message: "Tool flow contains a failure", title: event.title });
    }
  }

  if (counts.complete === 0) {
    findings.push({ risk: "approval", code: "missing-completion-proof", message: "No completion proof event was found" });
  }

  return {
    source,
    generatedAt: new Date(0).toISOString(),
    total: events.length,
    counts,
    tools: unique(events.map((event) => event.tool)),
    commands: unique(events.map((event) => event.command)),
    files: unique(events.map((event) => event.path)),
    findings,
    events
  };
}

function unique(values: Array<string | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))].sort();
}

