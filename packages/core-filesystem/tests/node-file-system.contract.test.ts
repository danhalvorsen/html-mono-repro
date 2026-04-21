import fs from "node:fs";
import os from "node:os";
import nodePath from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { NodeFileSystem } from "../src/code.js";

const tempRoots: string[] = [];

function createTempRoot(): string {
  const root = fs.mkdtempSync(nodePath.join(os.tmpdir(), "core-fs-contract-"));
  tempRoots.push(root);
  return root;
}

afterEach(() => {
  while (tempRoots.length > 0) {
    const root = tempRoots.pop();

    if (root !== undefined) {
      fs.rmSync(root, { recursive: true, force: true });
    }
  }
});

describe("NodeFileSystem contract", () => {
  it("readdir returns file and directory entry metadata", () => {
    const fileSystem = new NodeFileSystem();
    const root = createTempRoot();
    const directoryPath = nodePath.join(root, "dir");
    const filePath = nodePath.join(root, "a.txt");

    fs.mkdirSync(directoryPath, { recursive: true });
    fs.writeFileSync(filePath, "a", "utf8");

    const entries = fileSystem.readdir(root);
    const byName = new Map(entries.map((entry) => [entry.name, entry]));

    expect(byName.get("dir")?.isDirectory).toBe(true);
    expect(byName.get("dir")?.isFile).toBe(false);
    expect(byName.get("a.txt")?.isFile).toBe(true);
    expect(byName.get("a.txt")?.isDirectory).toBe(false);
  });
});
