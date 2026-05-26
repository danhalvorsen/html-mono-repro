import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const THIS_DIR = fileURLToPath(new URL(".", import.meta.url));

describe("feature: packaging exports", () => {
  it("package.json exports stepper and persistence subpaths", () => {
    const packageJsonPath = resolve(THIS_DIR, "..", "package.json");
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
      exports?: Record<string, unknown>;
    };

    expect(packageJson.exports?.["./stepper"]).toBeDefined();
    expect(packageJson.exports?.["./persistence"]).toBeDefined();
  });
});
