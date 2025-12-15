import fs from "fs";
import os from "os";
import path from "path";
import { describe, expect, it } from "vitest";
import { Path } from "@my-graphics/core-filesystem";
import { ModuleAnalyzer } from "../src/ModuleAnalyzer.js";

describe("ModuleAnalyzer", () => {
  it("reports missing package files or names and accepts names that contain the folder name", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "core-analyzer-"));
    const mkCore = (folder: string, pkg?: Record<string, unknown>) => {
      const dir = path.join(tempRoot, folder);
      fs.mkdirSync(dir, { recursive: true });
      if (pkg) {
        fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify(pkg), "utf-8");
      }
    };

    mkCore("core-missing"); // missing package.json
    mkCore("core-no-name", { version: "1.0.0" }); // missing name property
    mkCore("core-mismatch", { name: "library", version: "1.0.0" }); // name does not include folder
    mkCore("core-contained", { name: "@my-graphics/awesome-core-contained", version: "1.0.0" });
    mkCore("core-exact", { name: "core-exact", version: "1.0.0" });

    try {
      const analyzer = new ModuleAnalyzer(Path.from(tempRoot));
      const mismatches = analyzer.findMismatchedModules();

      expect(mismatches).toEqual(
        expect.arrayContaining([
          "core-missing (missing package.json)",
          "core-no-name (missing package name)",
          "core-mismatch (package name does not include folder: library)"
        ])
      );
      expect(mismatches.some((m) => m.startsWith("core-contained"))).toBe(false);
      expect(mismatches.some((m) => m.startsWith("core-exact"))).toBe(false);
      expect(mismatches).toHaveLength(3);
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});
