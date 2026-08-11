import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const temporaryDirectory = mkdtempSync(join(tmpdir(), "tooltrace-package-"));

function run(command, args, options = {}) {
  return execFileSync(command, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...options });
}

try {
  const packResult = JSON.parse(
    run("npm", ["pack", "--json", "--pack-destination", temporaryDirectory])
  )[0];
  const packageFiles = packResult.files.map(({ path }) => path);
  const forbiddenFiles = packageFiles.filter(
    (path) => path.startsWith("dist/tests/") || /(?:^|\/)tests?\/.*\.test\.(?:js|d\.ts)$/.test(path)
  );

  if (forbiddenFiles.length > 0) {
    throw new Error(`Package contains test build artifacts:\n${forbiddenFiles.join("\n")}`);
  }

  for (const requiredPath of [
    "dist/src/cli.js",
    "dist/src/index.js",
    "README.md",
    "docs/RELEASE_CANDIDATE.md",
    "examples/clean-events.jsonl",
    "examples/tool-events.jsonl"
  ]) {
    if (!packageFiles.includes(requiredPath)) throw new Error(`Package is missing ${requiredPath}`);
  }

  const tarball = join(temporaryDirectory, packResult.filename);
  const installDirectory = join(temporaryDirectory, "installed");
  run("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund", "--prefix", installDirectory, tarball]);

  const cli = join(installDirectory, "node_modules", ".bin", "tooltrace-skill");
  const installedPackage = join(installDirectory, "node_modules", "tooltrace-skill");
  const report = join(temporaryDirectory, "summary.md");
  const help = run(cli, ["--help"]);
  if (!help.includes("Usage:")) throw new Error("Installed CLI help did not include usage text");

  run(cli, ["summarize", join(installedPackage, "examples", "tool-events.jsonl"), "--out", report]);
  if (!readFileSync(report, "utf8").includes("ToolTrace Proof Summary")) {
    throw new Error("Installed CLI did not create the expected summary");
  }
  run(cli, ["check", join(installedPackage, "examples", "clean-events.jsonl"), "--fail-on", "approval"]);

  const invalidEvents = join(temporaryDirectory, "invalid-events.jsonl");
  writeFileSync(
    invalidEvents,
    `${JSON.stringify({ kind: "tool", title: "Inspect", tool: "shell\n- Fake evidence" })}\n`
  );
  try {
    run(cli, ["summarize", invalidEvents]);
    throw new Error("Installed CLI accepted control characters in event metadata");
  } catch (error) {
    if (error?.status !== 1 || error?.stdout !== "" || error?.stderr !== "Line 1 field tool contains unsupported control characters\n") {
      throw error;
    }
  }

  process.stdout.write(`Verified ${packResult.filename}: ${packageFiles.length} files, installed CLI, metadata diagnostics, and shipped examples\n`);
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}
