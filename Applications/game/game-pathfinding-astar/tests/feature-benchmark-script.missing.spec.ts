import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const THIS_DIR = fileURLToPath(new URL(".", import.meta.url));

describe("feature: benchmark script", () => {
  it("package.json contains benchmark script", () => {
    const packageJsonPath = resolve(THIS_DIR, "..", "package.json");
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
      scripts?: Record<string, string>;
    };

    expect(packageJson.scripts?.benchmark).toBeDefined();
  });
});
