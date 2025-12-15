import fs from "fs";
import os from "os";
import path from "path";
import { describe, expect, it } from "vitest";
import { compareContent } from "../src/compareContent.js";

describe("compareContent", () => {
  it("validates JSON via schema when available", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cmp-json-"));
    const a = path.join(dir, "a.json");
    const b = path.join(dir, "b.json");

    // Valid package.json shape
    fs.writeFileSync(
      a,
      JSON.stringify({ name: "pkg", version: "1.0.0", dependencies: { lodash: "^4.0.0" } }),
      "utf-8"
    );
    // Same content but different ordering should still compare equal
    fs.writeFileSync(
      b,
      JSON.stringify({ version: "1.0.0", name: "pkg", dependencies: { lodash: "^4.0.0" } }),
      "utf-8"
    );

    expect(compareContent(a, b)).toEqual({ equal: true });
  });

  it("rejects JSON that fails schema validation", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cmp-json-invalid-"));
    const a = path.join(dir, "a.json");
    const b = path.join(dir, "b.json");

    fs.writeFileSync(a, JSON.stringify({ name: "pkg", version: "1.0.0" }), "utf-8");
    // Missing required fields for package.json schema (e.g., name/version)
    fs.writeFileSync(b, JSON.stringify({ foo: "bar" }), "utf-8");

    const result = compareContent(a, b);
    expect(result.equal).toBe(false);
    expect(result.reason).toContain("schema");
  });

  it("rejects comparisons without a known schema", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cmp-txt-"));
    const a = path.join(dir, "a.txt");
    const b = path.join(dir, "b.txt");

    fs.writeFileSync(a, "hello   world\nnext line", "utf-8");
    fs.writeFileSync(b, "hello world\nnext   line", "utf-8");

    const result = compareContent(a, b);
    expect(result.equal).toBe(false);
    expect(result.reason).toContain("no schema");
  });
});
