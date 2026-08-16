import assert from "node:assert/strict";
import test from "node:test";
import { parseJsonl } from "../src/parser.js";

test("parses tool events", () => {
  const events = parseJsonl('{"kind":"command","title":"Run tests","command":"npm test","status":"ok"}\n');
  assert.equal(events.length, 1);
  assert.equal(events[0].kind, "command");
  assert.equal(events[0].command, "npm test");
});

test("rejects invalid kind", () => {
  assert.throws(() => parseJsonl('{"kind":"other","title":"Nope"}\n'), /invalid kind/);
});

test("rejects missing title", () => {
  assert.throws(() => parseJsonl('{"kind":"tool"}\n'), /missing title/);
});

test("preserves omitted and allowed status values", () => {
  const events = parseJsonl([
    '{"kind":"message","title":"No status"}',
    '{"kind":"message","title":"Succeeded","status":"ok"}',
    '{"kind":"message","title":"Failed","status":"failed"}',
    '{"kind":"message","title":"Waiting","status":"pending"}'
  ].join("\n"));

  assert.deepEqual(events.map((event) => event.status), [undefined, "ok", "failed", "pending"]);
});

for (const status of ["failure", "complete", null, 1] as const) {
  test(`rejects unsupported status ${JSON.stringify(status)}`, () => {
    const input = `\n${JSON.stringify({ kind: "message", title: "Event", status })}\n`;
    assert.throws(
      () => parseJsonl(input),
      /^Error: Line 2 field status must be one of ok, failed, or pending$/
    );
  });
}

test("reports physical line numbers when blank lines are skipped", () => {
  const input = [
    "",
    '{"kind":"command","title":"Run tests"}',
    "   ",
    '{"kind":"other","title":"Nope"}'
  ].join("\n");

  assert.throws(() => parseJsonl(input), /Line 4 has invalid kind/);
});

test("identifies the physical line containing malformed JSON", () => {
  const input = ['', '{"kind":"command","title":"Run tests"}', "{malformed}"].join("\n");

  assert.throws(() => parseJsonl(input), /Line 3 contains invalid JSON/);
});

for (const [field, value] of [
  ["title", "Run\ntests"],
  ["tool", "shell\rtool"],
  ["command", "npm test\u0000--watch"],
  ["path", "docs/CLI.md\ttemporary"]
] as const) {
  test(`rejects control characters in ${field} with a field and line diagnostic`, () => {
    const input = `\n${JSON.stringify({ kind: "command", title: "Run tests", [field]: value })}\n`;

    assert.throws(
      () => parseJsonl(input),
      new RegExp(`^Error: Line 2 field ${field} contains unsupported control characters$`)
    );
  });
}
