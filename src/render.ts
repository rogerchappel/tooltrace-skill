import type { TraceSummary } from "./types.js";

export function renderMarkdown(summary: TraceSummary): string {
  const lines = [
    "# ToolTrace Proof Summary",
    "",
    `Source: \`${summary.source}\``,
    `Events: ${summary.total}`,
    "",
    "## Activity Counts",
    "",
    "| Kind | Count |",
    "|---|---:|"
  ];

  for (const [kind, count] of Object.entries(summary.counts)) {
    lines.push(`| ${kind} | ${count} |`);
  }

  lines.push("", "## Evidence", "");
  lines.push(`- Tools: ${summary.tools.length ? summary.tools.map(code).join(", ") : "none"}`);
  lines.push(`- Commands: ${summary.commands.length ? summary.commands.map(code).join(", ") : "none"}`);
  lines.push(`- Files: ${summary.files.length ? summary.files.map(code).join(", ") : "none"}`);

  lines.push("", "## Findings", "");
  if (summary.findings.length === 0) {
    lines.push("No findings.");
  } else {
    for (const finding of summary.findings) {
      lines.push(`- **${finding.risk}** ${finding.code}: ${finding.message}${finding.title ? ` (${code(finding.title)})` : ""}`);
    }
  }
  lines.push("");
  return lines.join("\n");
}

export function renderJson(summary: TraceSummary): string {
  return `${JSON.stringify(summary, null, 2)}\n`;
}

function code(value: string): string {
  return `\`${value.replace(/`/g, "'")}\``;
}

