// packages/core-template-handlebar/tests/FilesystemWriter.test.ts

import { describe, expect, it } from "vitest";
import { Directory, File, Path } from "@monorepo/core-filesystem";
import { FilesystemWriter } from "../src/FilesystemWriter.js";

describe("FilesystemWriter", () => {
  it("should write content using core-filesystem File", () => {
    const dir = new Directory(Path.from("tests/.tmp/filesystem-writer"));
    const file = new File(dir.path.join("output.txt"));

    if (!dir.exists()) {
      dir.create();
    }

    if (file.exists()) {
      file.delete();
    }

    const sut = new FilesystemWriter();

    sut.write(file, "hello world");

    expect(file.exists()).toBe(true);
    expect(file.read()).toBe("hello world");

    file.delete();
  });
});