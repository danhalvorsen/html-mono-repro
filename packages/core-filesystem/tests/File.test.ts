// packages/core-filesystem/tests/File.test.ts

import { afterEach, describe, expect, it } from "vitest";
import { File } from "../src/File.js";
import { FileSystemTestFixture } from "./fixtures/FileSystemTestFixture.js"

describe("File", () => {
  let fixture: FileSystemTestFixture | null = null;

  afterEach(() => {
    fixture?.cleanup();
    fixture = null;
  });

  it("should write and read file content", () => {
    fixture = new FileSystemTestFixture();
    const file = new File(fixture.rootPath.join("file-test.txt"));

    file.write("hello");

    expect(file.read()).toBe("hello");
  });

  it("should report existence for a written file", () => {
    fixture = new FileSystemTestFixture();
    const file = new File(fixture.rootPath.join("file-test.txt"));

    file.write("test");

    expect(file.exists()).toBe(true);
  });

  it("should delete an existing file", () => {
    fixture = new FileSystemTestFixture();
    const file = fixture.createFile("file-test.txt", "test");

    file.delete();

    expect(file.exists()).toBe(false);
  });
});