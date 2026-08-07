import assert from "node:assert/strict";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
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
    ["dist/src/cli.js", "check", input, "--fail-on", "approval"],
    { encoding: "utf8" }
  );
  rmSync(directory, { recursive: true, force: true });
  return result;
}

function run(...args: string[]) {
  return spawnSync(process.execPath, ["dist/src/cli.js", ...args], { encoding: "utf8" });
}

function runWithInput(contents: string) {
  const directory = mkdtempSync(join(tmpdir(), "tooltrace-cli-input-test-"));
  const input = join(directory, "events.jsonl");
  writeFileSync(input, contents);
  const result = run("summarize", input);
  rmSync(directory, { recursive: true, force: true });
  return result;
}

test("CLI exits successfully and omits findings for resolved approval proof", () => {
  const result = check([
    { kind: "approval", title: "Approved by maintainer", status: "ok" },
    { kind: "complete", title: "Done", status: "ok" }
  ]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /No findings\./);
});

test("CLI reports failed completion and missing proof", () => {
  const result = check([
    { kind: "complete", title: "Run failed before delivery", status: "failed" }
  ]);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /failed-event/);
  assert.match(result.stdout, /missing-completion-proof/);
});

test("CLI summarizes valid input", () => {
  const result = run("summarize", "examples/clean-events.jsonl", "--format", "json");
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).source, "examples/clean-events.jsonl");
});

test("CLI reports schema errors at their physical line", () => {
  const result = runWithInput('\n{"kind":"command","title":"Run tests"}\n   \n{"kind":"other","title":"Nope"}\n');
  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /^Line 4 has invalid kind\n$/);
});

test("CLI reports malformed JSON at its physical line", () => {
  const result = runWithInput('\n{"kind":"complete","title":"Done"}\n{malformed}\n');
  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /^Line 3 contains invalid JSON: .+\n$/);
});

test("CLI prints help successfully only when explicitly requested", () => {
  const help = run("--help");
  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /Usage:/);

  const missing = run();
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /Missing command/);
});

for (const [command, option, value] of [
  ["summarize", "--fail-on", "info"],
  ["summarize", "--config", "examples/tooltrace-skill.config.json"],
  ["check", "--format", "json"],
  ["check", "--out", "report.md"]
] as const) {
  test(`CLI rejects ${option} for ${command} without writing output`, () => {
    const directory = mkdtempSync(join(tmpdir(), "tooltrace-cli-option-test-"));
    const output = join(directory, "report.md");
    const optionValue = option === "--out" ? output : value;
    const result = run(command, "examples/clean-events.jsonl", option, optionValue);

    assert.equal(result.status, 1);
    assert.equal(result.stdout, "");
    assert.match(result.stderr, new RegExp(`^${option} is not valid for ${command}\\n$`));
    assert.equal(existsSync(output), false);
    rmSync(directory, { recursive: true, force: true });
  });
}

for (const [name, args, diagnostic] of [
  ["unknown command", ["summrize", "examples/clean-events.jsonl"], /Unknown command: summrize/],
  ["unsupported format", ["summarize", "examples/clean-events.jsonl", "--format", "yaml"], /Unsupported format: yaml/],
  ["missing --out value", ["summarize", "examples/clean-events.jsonl", "--out"], /Missing value for --out/],
  ["missing --format value", ["summarize", "examples/clean-events.jsonl", "--format"], /Missing value for --format/],
  ["missing --fail-on value", ["check", "examples/clean-events.jsonl", "--fail-on"], /Missing value for --fail-on/],
  ["missing --config value", ["check", "examples/clean-events.jsonl", "--config"], /Missing value for --config/]
] as const) {
  test(`CLI rejects ${name}`, () => {
    const result = run(...args);
    assert.equal(result.status, 1);
    assert.match(result.stderr, diagnostic);
  });
}
