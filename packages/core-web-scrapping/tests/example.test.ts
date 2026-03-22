// tests/example.test.ts

import { describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { loadExampleData, writeExampleData } from "../src/index.js";
import { exampleData } from "../src/fixtures/exampleData.js";

describe("core.module.example.nodejs", () => {
  it("writes and loads example data from disk", async () => {
    const tempRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "core-module-example-"),
    );

    try {
      const filePath = await writeExampleData(
        tempRoot,
        "example.json",
        exampleData,
      );

      const response = await loadExampleData(filePath);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(exampleData);
    } finally {
      await fs.rm(tempRoot, { recursive: true, force: true });
    }
  });
});