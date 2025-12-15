import fs from "fs";
import os from "os";
import path from "path";
import { describe, expect, it } from "vitest";
import { WatchDog } from "../src/WatchDog.js";

const tmpDir = () => fs.mkdtempSync(path.join(os.tmpdir(), "watchdog-"));

describe("WatchDog", () => {
  it("accepts allowed tsconfig profile", () => {
    const dir = tmpDir();
    const file = path.join(dir, "tsconfig.json");
    fs.writeFileSync(
      file,
      JSON.stringify(
        {
          extends: "../config-standards/tsconfig.node.json",
          compilerOptions: { target: "ES2022", lib: ["ES2022"] }
        },
        null,
        2
      )
    );

    const wd = new WatchDog(dir);
    expect(wd.checkTsconfig(file)).toEqual({ ok: true });
  });

  it("rejects disallowed extends", () => {
    const dir = tmpDir();
    const file = path.join(dir, "tsconfig.json");
    fs.writeFileSync(
      file,
      JSON.stringify(
        {
          extends: "./something-else.json",
          compilerOptions: { target: "ES2022", lib: ["ES2022"] }
        },
        null,
        2
      )
    );

    const wd = new WatchDog(dir);
    const res = wd.checkTsconfig(file);
    expect(res.ok).toBe(false);
    expect(res && "reasons" in res ? res.reasons : []).toContain(
      "extends not allowed: ./something-else.json"
    );
  });

  it("detects hash mismatch against reference", () => {
    const dir = tmpDir();
    const referenceDir = path.join(dir, "reference");
    fs.mkdirSync(referenceDir);

    const relative = "package.json";
    const currentPath = path.join(dir, relative);
    const referencePath = path.join(referenceDir, relative);

    fs.writeFileSync(currentPath, JSON.stringify({ name: "a" }));
    fs.writeFileSync(referencePath, JSON.stringify({ name: "b" }));

    const wd = new WatchDog(referenceDir);
    const res = wd.compareWithReference(relative);
    expect(res.ok).toBe(false);
  });
});
