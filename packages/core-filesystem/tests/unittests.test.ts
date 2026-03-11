// ============================================================================
// packages/core-filesystem/tests/core-filesystem.test.ts
// ============================================================================

import fs from "node:fs";
import os from "node:os";
import nodePath from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  CoreFileSystemModule,
  Directory,
  File,
  FileSystemEvent,
  FileSystemEventType,
  IFileSystemObserver,
  Path,
  PollingDirectoryWatcher,
  PollingDirectoryWatcherOptions
} from "../src/code.js";

class FileSystemTestFixture {
  public readonly module: CoreFileSystemModule;
  public readonly rootFsPath: string;
  public readonly rootPath: Path;
  public readonly rootDirectory: Directory;

  public constructor() {
    this.module = new CoreFileSystemModule();
    this.rootFsPath = fs.mkdtempSync(nodePath.join(os.tmpdir(), "core-filesystem-"));
    this.rootPath = Path.from(this.rootFsPath);
    this.rootDirectory = this.module.createDirectory(this.rootPath);
  }

  public createFile(relativePath: string, content: string = ""): File {
    const file = this.module.createFile(this.rootPath.join(relativePath));
    file.write(content);
    return file;
  }

  public createDirectory(relativePath: string): Directory {
    const directory = this.module.createDirectory(this.rootPath.join(relativePath));
    directory.create(true);
    return directory;
  }

  public createWatcher(
    options: PollingDirectoryWatcherOptions = new PollingDirectoryWatcherOptions(50, true)
  ): PollingDirectoryWatcher {
    return this.module.createPollingDirectoryWatcher(this.rootDirectory, options);
  }

  public cleanup(): void {
    if (this.rootDirectory.exists()) {
      this.rootDirectory.delete(true);
    }
  }
}

class FixtureScope {
  private fixture: FileSystemTestFixture | null = null;

  public get fixtureInstance(): FileSystemTestFixture {
    if (this.fixture === null) {
      this.fixture = new FileSystemTestFixture();
    }

    return this.fixture;
  }

  public cleanup(): void {
    this.fixture?.cleanup();
    this.fixture = null;
  }
}

class TestObserver implements IFileSystemObserver {
  private readonly events: FileSystemEvent[] = [];

  public onFileSystemEvent(event: FileSystemEvent): void {
    this.events.push(event);
  }

  public getEvents(): ReadonlyArray<FileSystemEvent> {
    return this.events;
  }

  public hasEvent(type: FileSystemEventType, relative: string): boolean {
    return this.events.some(
      (event) => event.type === type && event.relative === relative
    );
  }
}

class TestDelay {
  public async wait(milliseconds: number): Promise<void> {
    await new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
  }
}

const scope = new FixtureScope();

afterEach(() => {
  scope.cleanup();
});

describe("core-filesystem exports", () => {
  it("should export the public OOP surface", () => {
    expect(CoreFileSystemModule).toBeTypeOf("function");
    expect(Path).toBeTypeOf("function");
    expect(File).toBeTypeOf("function");
    expect(Directory).toBeTypeOf("function");
    expect(FileSystemEvent).toBeTypeOf("function");
    expect(PollingDirectoryWatcher).toBeTypeOf("function");
    expect(PollingDirectoryWatcherOptions).toBeTypeOf("function");
    expect(FileSystemEventType.FileCreated).toBe("file.created");
  });
});

describe("Path", () => {
  it("should create a resolved path", () => {
    const path = Path.from("folder", "file.txt");

    expect(path.full).toMatch(/folder[\\/]file\.txt$/);
  });

  it("should expose basename, extension, parent and equality", () => {
    const path = Path.from("folder", "file.txt");
    const same = new Path(path.full);

    expect(path.basename).toBe("file.txt");
    expect(path.extension).toBe(".txt");
    expect(path.parent.full).not.toBe(path.full);
    expect(path.equals(same)).toBe(true);
  });

  it("should compute relative paths", () => {
    const root = Path.from("tmp", "root");
    const child = root.join("sub", "a.txt");

    expect(child.relativeTo(root)).toBe(nodePath.join("sub", "a.txt"));
  });

  it("should detect path existence", () => {
    const fixture = scope.fixtureInstance;
    const file = fixture.createFile("exists.txt", "data");

    expect(file.path.exists()).toBe(true);
  });
});

describe("File", () => {
  it("should write and read file content", () => {
    const fixture = scope.fixtureInstance;
    const file = fixture.module.createFile(fixture.rootPath.join("file-test.txt"));

    file.write("hello");

    expect(file.read()).toBe("hello");
  });

  it("should report existence for a written file", () => {
    const fixture = scope.fixtureInstance;
    const file = fixture.module.createFile(fixture.rootPath.join("exists.txt"));

    file.write("test");

    expect(file.exists()).toBe(true);
  });

  it("should delete an existing file safely", () => {
    const fixture = scope.fixtureInstance;
    const file = fixture.createFile("delete.txt", "test");

    file.delete();
    file.delete();

    expect(file.exists()).toBe(false);
  });

  it("should create parent directories when writing nested files", () => {
    const fixture = scope.fixtureInstance;
    const file = fixture.module.createFile(fixture.rootPath.join("a", "b", "nested.txt"));

    file.write("nested");

    expect(file.exists()).toBe(true);
    expect(file.read()).toBe("nested");
  });
});

describe("Directory", () => {
  it("should exist after fixture creation", () => {
    const fixture = scope.fixtureInstance;

    expect(fixture.rootDirectory.exists()).toBe(true);
  });

  it("should list files", () => {
    const fixture = scope.fixtureInstance;
    fixture.createFile("sample.txt", "sample");

    const files = fixture.rootDirectory.listFiles();

    expect(files).toHaveLength(1);
    expect(files[0].path.basename).toBe("sample.txt");
  });

  it("should list subdirectories", () => {
    const fixture = scope.fixtureInstance;
    fixture.createDirectory("sub");

    const dirs = fixture.rootDirectory.listDirs();

    expect(dirs).toHaveLength(1);
    expect(dirs[0].path.basename).toBe("sub");
  });

  it("should delete directory safely", () => {
    const fixture = scope.fixtureInstance;

    fixture.rootDirectory.delete(true);
    fixture.rootDirectory.delete(true);

    expect(fixture.rootDirectory.exists()).toBe(false);
  });
});

describe("CoreFileSystemModule", () => {
  it("should create file, directory and watcher instances", () => {
    const fixture = scope.fixtureInstance;

    const file = fixture.module.createFile(fixture.rootPath.join("module.txt"));
    const directory = fixture.module.createDirectory(fixture.rootPath.join("module-dir"));
    const watcher = fixture.module.createPollingDirectoryWatcher(
      fixture.rootDirectory,
      new PollingDirectoryWatcherOptions(50, true)
    );

    expect(file).toBeInstanceOf(File);
    expect(directory).toBeInstanceOf(Directory);
    expect(watcher).toBeInstanceOf(PollingDirectoryWatcher);

    watcher.stop();
  });
});

describe("PollingDirectoryWatcher", () => {
  it("should emit file.created and file.modified", async () => {
    const fixture = scope.fixtureInstance;
    const watcher = fixture.createWatcher();
    const observer = new TestObserver();
    const delay = new TestDelay();

    watcher.subscribe(observer);
    watcher.start();

    const file = fixture.module.createFile(fixture.rootPath.join("a.txt"));

    await delay.wait(80);
    file.write("one");
    await delay.wait(120);
    file.write("two");
    await delay.wait(120);

    watcher.stop();

    expect(observer.hasEvent(FileSystemEventType.FileCreated, "a.txt")).toBe(true);
    expect(observer.hasEvent(FileSystemEventType.FileModified, "a.txt")).toBe(true);
  });

  it("should emit file.deleted", async () => {
    const fixture = scope.fixtureInstance;
    const file = fixture.createFile("b.txt", "one");
    const watcher = fixture.createWatcher();
    const observer = new TestObserver();
    const delay = new TestDelay();

    watcher.subscribe(observer);
    watcher.start();

    await delay.wait(80);
    file.delete();
    await delay.wait(120);

    watcher.stop();

    expect(observer.hasEvent(FileSystemEventType.FileDeleted, "b.txt")).toBe(true);
  });

  it("should emit directory created recursively", async () => {
    const fixture = scope.fixtureInstance;
    const watcher = fixture.createWatcher();
    const observer = new TestObserver();
    const delay = new TestDelay();

    watcher.subscribe(observer);
    watcher.start();

    await delay.wait(80);
    fixture.createDirectory("child");
    await delay.wait(120);

    watcher.stop();

    expect(observer.hasEvent(FileSystemEventType.DirectoryCreated, "child")).toBe(true);
  });

  it("should emit nested file events when recursive is enabled", async () => {
    const fixture = scope.fixtureInstance;
    const watcher = fixture.createWatcher(new PollingDirectoryWatcherOptions(50, true));
    const observer = new TestObserver();
    const delay = new TestDelay();

    watcher.subscribe(observer);
    watcher.start();

    await delay.wait(80);
    fixture.createDirectory("nested");
    await delay.wait(120);
    const file = fixture.createFile(nodePath.join("nested", "deep.txt"), "one");
    await delay.wait(120);
    file.write("two");
    await delay.wait(120);

    watcher.stop();

    expect(observer.hasEvent(FileSystemEventType.DirectoryCreated, "nested")).toBe(true);
    expect(observer.hasEvent(FileSystemEventType.FileCreated, nodePath.join("nested", "deep.txt"))).toBe(true);
    expect(observer.hasEvent(FileSystemEventType.FileModified, nodePath.join("nested", "deep.txt"))).toBe(true);
  });

  it("should not emit nested file events when recursive is disabled", async () => {
    const fixture = scope.fixtureInstance;
    const watcher = fixture.createWatcher(new PollingDirectoryWatcherOptions(50, false));
    const observer = new TestObserver();
    const delay = new TestDelay();

    fixture.createDirectory("nested");

    watcher.subscribe(observer);
    watcher.start();

    await delay.wait(80);
    fixture.createFile(nodePath.join("nested", "deep.txt"), "one");
    await delay.wait(150);

    watcher.stop();

    expect(
      observer.hasEvent(FileSystemEventType.FileCreated, nodePath.join("nested", "deep.txt"))
    ).toBe(false);
  });

  it("should allow unsubscribe", async () => {
    const fixture = scope.fixtureInstance;
    const watcher = fixture.createWatcher();
    const observer = new TestObserver();
    const delay = new TestDelay();

    const subscription = watcher.subscribe(observer);
    watcher.start();

    subscription.unsubscribe();

    await delay.wait(80);
    fixture.createFile("unsubscribed.txt", "one");
    await delay.wait(120);

    watcher.stop();

    expect(observer.getEvents()).toHaveLength(0);
  });

  it("should throw when root does not exist on start", () => {
    const fixture = scope.fixtureInstance;
    const missingRoot = fixture.module.createDirectory(fixture.rootPath.join("missing-root"));
    const watcher = fixture.module.createPollingDirectoryWatcher(
      missingRoot,
      new PollingDirectoryWatcherOptions(50, true)
    );

    expect(() => watcher.start()).toThrowError(/root does not exist/i);
  });

  it("should tolerate repeated start and stop", () => {
    const fixture = scope.fixtureInstance;
    const watcher = fixture.createWatcher();

    watcher.start();
    watcher.start();
    watcher.stop();
    watcher.stop();

    expect(true).toBe(true);
  });
});