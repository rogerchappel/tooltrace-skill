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
