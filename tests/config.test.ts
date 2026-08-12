import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
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

for (const failOn of ["info", "approval", "error"] as const) {
  test(`accepts ${failOn} policy`, async () => {
    const directory = await mkdtemp(join(tmpdir(), "tooltrace-config-test-"));
    const path = join(directory, "config.json");
    await writeFile(path, JSON.stringify({ failOn }));
    try {
      assert.deepEqual(await readConfig(path), { failOn });
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
}

for (const [name, contents, diagnostic] of [
  ["unsupported failOn", '{"failOn":"approvl"}', /failOn must be one of info, approval, or error/],
  ["malformed JSON", '{"failOn":', /Invalid configuration in .*config\.json: .+/]
] as const) {
  test(`rejects ${name}`, async () => {
    const directory = await mkdtemp(join(tmpdir(), "tooltrace-config-test-"));
    const path = join(directory, "config.json");
    await writeFile(path, contents);
    try {
      await assert.rejects(readConfig(path), diagnostic);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
}
