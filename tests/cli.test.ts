import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

function check(events: object[]) {
  const directory = mkdtempSync(join(tmpdir(), "tooltrace-cli-test-"));
  const input = join(directory, "events.jsonl");
  writeFileSync(input, `${events.map((event) => JSON.stringify(event)).join("\n")}\n`);
  const result = spawnSync(
    process.execPath,
    ["dist/src/cli.js", "check", input, "--fail-on", "approval", "--format", "json"],
    { encoding: "utf8" }
  );
  rmSync(directory, { recursive: true, force: true });
  return result;
}

test("CLI exits successfully and omits findings for resolved approval proof", () => {
  const result = check([
    { kind: "approval", title: "Approved by maintainer", status: "ok" },
    { kind: "complete", title: "Done", status: "ok" }
  ]);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout).findings, []);
});

test("CLI reports failed completion and missing proof", () => {
  const result = check([
    { kind: "complete", title: "Run failed before delivery", status: "failed" }
  ]);
  assert.equal(result.status, 1);
  assert.deepEqual(
    JSON.parse(result.stdout).findings.map((finding: { code: string }) => finding.code),
    ["failed-event", "missing-completion-proof"]
  );
});
