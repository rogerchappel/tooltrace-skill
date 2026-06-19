import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { summarize, shouldFail } from "../src/analyze.js";
import { renderMarkdown } from "../src/render.js";

test("summarizes tools commands and files", () => {
  const summary = summarize("fixture", [
    { kind: "command", title: "Run tests", command: "npm test", status: "ok" },
    { kind: "tool", title: "Read file", tool: "file_fetch", status: "ok" },
    { kind: "file", title: "Update docs", path: "README.md", status: "ok" },
    { kind: "complete", title: "Done", status: "ok" }
  ]);
  assert.equal(summary.total, 4);
  assert.deepEqual(summary.commands, ["npm test"]);
  assert.deepEqual(summary.tools, ["file_fetch"]);
  assert.deepEqual(summary.files, ["README.md"]);
  assert.equal(summary.findings.length, 0);
});

test("flags approvals failures and missing completion proof", () => {
  const summary = summarize("fixture", [
    { kind: "approval", title: "Needs approval", status: "pending" },
    { kind: "error", title: "Failed smoke", status: "failed" }
  ]);
  assert.equal(shouldFail(summary.findings, "approval"), true);
  assert.equal(shouldFail(summary.findings, "error"), true);
  assert.equal(summary.findings.length, 3);
});

test("renders markdown proof summary", () => {
  const summary = summarize("fixture", [
    { kind: "complete", title: "Done", status: "ok" }
  ]);
  assert.match(renderMarkdown(summary), /ToolTrace Proof Summary/);
  assert.match(renderMarkdown(summary), /Activity Counts/);
});

test("matches expected clean proof report", () => {
  const summary = summarize("examples/clean-events.jsonl", [
    { kind: "command", title: "Run tests", command: "npm test", status: "ok" },
    { kind: "tool", title: "Inspect files", tool: "file_fetch", status: "ok" },
    { kind: "file", title: "Update docs", path: "docs/PRD.md", status: "ok" },
    { kind: "complete", title: "Proof ready", status: "ok" }
  ]);
  assert.equal(renderMarkdown(summary), readFileSync("examples/expected-clean-report.md", "utf8"));
});

