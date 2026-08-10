import { rmSync } from "node:fs";

const directory = process.argv[2];
if (directory !== "dist" && directory !== "dist-test") {
  throw new Error("Expected the build directory dist or dist-test");
}

rmSync(directory, { recursive: true, force: true });
