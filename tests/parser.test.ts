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

