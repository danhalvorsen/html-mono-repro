// packages/core-filesystem/tests/polling-directory-watcher.test.ts

import os from "node:os";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Directory } from "../src/Directory.js";
import type { FileSystemEvent } from "../src/Events/FileSystemEvent.js";
import { File } from "../src/File.js";
import { Path } from "../src/Path.js";
import { PollingDirectoryWatcher } from "../src/Reactive/PollingDirectoryWatcher.js";

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe("PollingDirectoryWatcher", () => {
  let rootPath: Path;
  let rootDirectory: Directory;
  let watcher: PollingDirectoryWatcher;

  beforeEach(() => {
    rootPath = Path.from(
      os.tmpdir(),
      `core-filesystem-watch-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    );
    rootDirectory = new Directory(rootPath);
    rootDirectory.create(true);

    watcher = new PollingDirectoryWatcher(rootDirectory, {
      intervalMs: 50,
      recursive: true,
    });
  });

  afterEach(() => {
    watcher.stop();
    rootDirectory.delete(true);
  });

  it("should emit file.created and file.modified", async () => {
    const events: FileSystemEvent[] = [];
    watcher.subscribe(event => events.push(event));
    watcher.start();

    const file = new File(rootPath.join("a.txt"));

    await delay(80);
    file.write("one");
    await delay(120);
    file.write("two");
    await delay(120);

    expect(events.some(x => x.type === "file.created" && x.relative === "a.txt")).toBe(true);
    expect(events.some(x => x.type === "file.modified" && x.relative === "a.txt")).toBe(true);
  });

  it("should emit file.deleted", async () => {
    const file = new File(rootPath.join("b.txt"));
    file.write("one");

    const events: FileSystemEvent[] = [];
    watcher.subscribe(event => events.push(event));
    watcher.start();

    await delay(80);
    file.delete();
    await delay(120);

    expect(events.some(x => x.type === "file.deleted" && x.relative === "b.txt")).toBe(true);
  });

  it("should emit dir.created recursively", async () => {
    const events: FileSystemEvent[] = [];
    watcher.subscribe(event => events.push(event));
    watcher.start();

    await delay(80);
    const child = new Directory(rootPath.join("child"));
    child.create(true);
    await delay(120);

    expect(events.some(x => x.type === "dir.created" && x.relative === "child")).toBe(true);
  });
});