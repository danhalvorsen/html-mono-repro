// packages/core-filesystem/tests/PollingDirectoryWatcher.test.ts

import { afterEach, describe, expect, it } from "vitest";
 
import { PollingDirectoryWatcher } from "../src/Reactive/PollingDirectoryWatcher.js";
import { FileSystemEvent } from "../src/Events/FileSystemEvent.js";
import { FileSystemTestFixture } from "./fixtures/FileSystemTestFixture.js";

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe("PollingDirectoryWatcher", () => {
  let fixture: FileSystemTestFixture | null = null;

  afterEach(() => {
    fixture?.cleanup();
    fixture = null;
  });

  it("should export the watcher from the package root", async () => {
    const module = await import("../src/index.js");
    expect(module.PollingDirectoryWatcher).toBeDefined();
  });

  it("should detect file creation", async () => {
    fixture = new FileSystemTestFixture();
    const root = fixture.createDirectory("watched");
    const watcher = new PollingDirectoryWatcher(root, { intervalMs: 25 });
    const events: FileSystemEvent[] = [];

    watcher.subscribe(event => events.push(event));
    watcher.start();

    await delay(50);
    fixture.createFile("watched/created.txt", "hello");
    await delay(100);

    watcher.stop();

    expect(events.some(x => x.type === "file.created" && x.relative === "created.txt")).toBe(true);
  });

  it("should detect file modification", async () => {
    fixture = new FileSystemTestFixture();
    const root = fixture.createDirectory("watched");
    const file = fixture.createFile("watched/modified.txt", "v1");
    const watcher = new PollingDirectoryWatcher(root, { intervalMs: 25 });
    const events: FileSystemEvent[] = [];

    watcher.subscribe(event => events.push(event));
    watcher.start();

    await delay(50);
    file.write("v2");
    await delay(100);

    watcher.stop();

    expect(events.some(x => x.type === "file.modified" && x.relative === "modified.txt")).toBe(true);
  });

  it("should detect file deletion", async () => {
    fixture = new FileSystemTestFixture();
    const root = fixture.createDirectory("watched");
    const file = fixture.createFile("watched/deleted.txt", "v1");
    const watcher = new PollingDirectoryWatcher(root, { intervalMs: 25 });
    const events: FileSystemEvent[] = [];

    watcher.subscribe(event => events.push(event));
    watcher.start();

    await delay(50);
    file.delete();
    await delay(100);

    watcher.stop();

    expect(events.some(x => x.type === "file.deleted" && x.relative === "deleted.txt")).toBe(true);
  });

  it("should detect directory creation", async () => {
    fixture = new FileSystemTestFixture();
    const root = fixture.createDirectory("watched");
    const watcher = new PollingDirectoryWatcher(root, { intervalMs: 25 });
    const events: FileSystemEvent[] = [];

    watcher.subscribe(event => events.push(event));
    watcher.start();

    await delay(50);
    fixture.createDirectory("watched/sub");
    await delay(100);

    watcher.stop();

    expect(events.some(x => x.type === "dir.created" && x.relative === "sub")).toBe(true);
  });

  it("should detect directory deletion", async () => {
    fixture = new FileSystemTestFixture();
    const root = fixture.createDirectory("watched");
    const sub = fixture.createDirectory("watched/sub");
    const watcher = new PollingDirectoryWatcher(root, { intervalMs: 25 });
    const events: FileSystemEvent[] = [];

    watcher.subscribe(event => events.push(event));
    watcher.start();

    await delay(50);
    sub.delete(true);
    await delay(100);

    watcher.stop();

    expect(events.some(x => x.type === "dir.deleted" && x.relative === "sub")).toBe(true);
  });

  it("should not emit create events for baseline content present before start", async () => {
    fixture = new FileSystemTestFixture();
    const root = fixture.createDirectory("watched");
    fixture.createFile("watched/already-there.txt", "v1");
    fixture.createDirectory("watched/already-dir");

    const watcher = new PollingDirectoryWatcher(root, { intervalMs: 25 });
    const events: FileSystemEvent[] = [];

    watcher.subscribe(event => events.push(event));
    watcher.start();

    await delay(100);
    watcher.stop();

    expect(events).toHaveLength(0);
  });

  it("should detect nested file creation when recursive is enabled", async () => {
    fixture = new FileSystemTestFixture();
    const root = fixture.createDirectory("watched");
    fixture.createDirectory("watched/a");

    const watcher = new PollingDirectoryWatcher(root, {
      intervalMs: 25,
      recursive: true
    });

    const events: FileSystemEvent[] = [];
    watcher.subscribe(event => events.push(event));
    watcher.start();

    await delay(50);
    fixture.createDirectory("watched/a/b");
    fixture.createFile("watched/a/b/nested.txt", "hello");
    await delay(125);

    watcher.stop();

    expect(
      events.some(
        x =>
          x.type === "dir.created" &&
          normalizeRelative(x.relative) === normalizeRelative("a/b")
      )
    ).toBe(true);
    expect(events.some(x => x.type === "file.created" && normalizeRelative(x.relative) === normalizeRelative("a/b/nested.txt"))).toBe(true);
  });

  it("should not detect nested file creation when recursive is disabled", async () => {
    fixture = new FileSystemTestFixture();
    const root = fixture.createDirectory("watched");
    fixture.createDirectory("watched/a");

    const watcher = new PollingDirectoryWatcher(root, {
      intervalMs: 25,
      recursive: false
    });

    const events: FileSystemEvent[] = [];
    watcher.subscribe(event => events.push(event));
    watcher.start();

    await delay(50);
    fixture.createDirectory("watched/a/b");
    fixture.createFile("watched/a/b/nested.txt", "hello");
    await delay(125);

    watcher.stop();

    expect(events.some(x => normalizeRelative(x.relative) === normalizeRelative("a/b/nested.txt"))).toBe(false);
  });
});

function normalizeRelative(value: string): string {
  return value.replace(/\\/g, "/");
}
