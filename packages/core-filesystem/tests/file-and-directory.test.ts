// packages/core-filesystem/tests/file-and-directory.test.ts

import os from "node:os";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Directory } from "../src/Directory.js";
import { File } from "../src/File.js";
import { Path } from "../src/Path.js";

describe("File and Directory", () => {
  let rootPath: Path;
  let rootDirectory: Directory;

  beforeEach(() => {
    rootPath = Path.from(
      os.tmpdir(),
      `core-filesystem-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    );
    rootDirectory = new Directory(rootPath);
    rootDirectory.create(true);
  });

  afterEach(() => {
    rootDirectory.delete(true);
  });

  it("should create, write, read and detect file", () => {
    const file = new File(rootPath.join("sample.txt"));

    file.write("sample");

    expect(file.exists()).toBe(true);
    expect(file.read()).toBe("sample");
  });

  it("should list files in directory", () => {
    const file = new File(rootPath.join("sample.txt"));
    file.write("sample");

    const files = rootDirectory.listFiles();

    expect(files).toHaveLength(1);
    expect(files[0].path.basename).toBe("sample.txt");
  });

  it("should list subdirectories", () => {
    const child = new Directory(rootPath.join("child"));
    child.create(true);

    const dirs = rootDirectory.listDirs();

    expect(dirs).toHaveLength(1);
    expect(dirs[0].path.basename).toBe("child");
  });

  it("should delete file safely", () => {
    const file = new File(rootPath.join("sample.txt"));
    file.write("sample");

    file.delete();
    file.delete();

    expect(file.exists()).toBe(false);
  });
});