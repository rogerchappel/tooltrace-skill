import assert from "node:assert/strict";
import test from "node:test";
import { readConfig } from "../src/config.js";

test("reads tooltrace risk policy", async () => {
  const config = await readConfig("examples/tooltrace-skill.config.json");
  assert.equal(config.failOn, "approval");
});

test("uses safe default policy", async () => {
  const config = await readConfig(undefined);
  assert.equal(config.failOn, "error");
});

