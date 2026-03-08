// packages/core-filesystem/tests/exports.smoke.test.ts

import { describe, expect, it } from "vitest";
import {
  Directory,
  File,
  Path,
  PollingDirectoryWatcher,
} from "../src/index.js";

describe("core-filesystem exports", () => {
  it("should export filesystem primitives", () => {
    expect(Directory).toBeTypeOf("function");
    expect(File).toBeTypeOf("function");
    expect(Path).toBeTypeOf("function");
    expect(PollingDirectoryWatcher).toBeTypeOf("function");
  });
});