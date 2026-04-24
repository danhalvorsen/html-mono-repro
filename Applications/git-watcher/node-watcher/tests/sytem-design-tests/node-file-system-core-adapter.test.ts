import { afterEach, describe, expect, test } from "vitest";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { NodeFileSystem } from "../../src/index.js";

const createdRoots: string[] = [];

async function createTempRoot(): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "node-watcher-fs-"));
  createdRoots.push(root);
  return root;
}

afterEach(async () => {
  while (createdRoots.length > 0) {
    const root = createdRoots.pop();

    if (root !== undefined) {
      await fs.rm(root, { recursive: true, force: true });
    }
  }
});

describe("NodeFileSystem (core-filesystem adapter)", () => {
  test("reads and writes utf8 content through core filesystem", async () => {
    const fileSystem = new NodeFileSystem();
    const root = await createTempRoot();
    const filePath = path.join(root, "state.txt");

    await fileSystem.writeUtf8File(filePath, "hello");
    const content = await fileSystem.readUtf8File(filePath);

    expect(content).toBe("hello");
  });

  test("returns file and directory entries with expected shape", async () => {
    const fileSystem = new NodeFileSystem();
    const root = await createTempRoot();
    const dirPath = path.join(root, "sub");
    const filePath = path.join(root, "file.txt");

    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(filePath, "x", "utf8");

    const directoryEntry = await fileSystem.getEntry(dirPath);
    const fileEntry = await fileSystem.getEntry(filePath);
    const missingEntry = await fileSystem.getEntry(path.join(root, "missing"));

    expect(directoryEntry).toEqual({
      absolutePath: dirPath,
      isDirectory: true,
    });
    expect(fileEntry).toEqual({
      absolutePath: filePath,
      isDirectory: false,
    });
    expect(missingEntry).toBeNull();
  });

  test("maps readDirectory entries to absolute paths", async () => {
    const fileSystem = new NodeFileSystem();
    const root = await createTempRoot();

    await fs.mkdir(path.join(root, "nested"), { recursive: true });
    await fs.writeFile(path.join(root, "plain.txt"), "plain", "utf8");

    const entries = await fileSystem.readDirectory(root);
    const byPath = new Map(entries.map((entry) => [entry.absolutePath, entry]));

    expect(byPath.get(path.join(root, "nested"))?.isDirectory).toBe(true);
    expect(byPath.get(path.join(root, "plain.txt"))?.isDirectory).toBe(false);
  });
});
