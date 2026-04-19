// packages/core-filesystem/src/code.ts

import fs from "node:fs";
import nodePath from "node:path";
import type { ILogger } from "@monorepo/core-logger-abstract";
import { FileSystemEvent } from "./FileSystemEvent.js";
import { FileSystemEventType } from "./FileSystemEventType.js";

export { FileSystemEvent } from "./FileSystemEvent.js";
export { FileSystemEventType } from "./FileSystemEventType.js";

const nullLogger: ILogger = {
  info() {},
  warn() {},
  error() {},
  debug() {}
};
 
// ============================================================================
// Contracts
// ============================================================================

export interface IFileSystemObserver {
  onFileSystemEvent(event: FileSystemEvent): void;
}

export interface IFileSystemEmitter {
  subscribe(observer: IFileSystemObserver): ISubscription;
  start(): void;
  stop(): void;
}

export interface ISubscription {
  unsubscribe(): void;
}

export interface IClock {
  now(): number;
}

export interface IFileSystemEntry {
  readonly name: string;
  readonly isFile: boolean;
  readonly isDirectory: boolean;
}

export interface IFileSystemStat {
  readonly mtimeMs: number;
}

export interface IFileSystem {
  exists(path: string): boolean;
  mkdir(path: string, recursive: boolean): void;
  rm(path: string, recursive: boolean, force: boolean): void;
  readdir(path: string): ReadonlyArray<IFileSystemEntry>;
  readFile(path: string, encoding: BufferEncoding): string;
  writeFile(path: string, content: string, encoding: BufferEncoding): void;
  unlink(path: string): void;
  stat(path: string): IFileSystemStat;
}

export interface IDirectorySnapshotEntry {
  readonly path: Path;
  readonly kind: EntryKind;
  readonly mtimeMs: number;
}

export interface IDirectorySnapshot {
  getEntries(): ReadonlyMap<string, IDirectorySnapshotEntry>;
}

export interface IDirectorySnapshotProvider {
  create(root: Directory): IDirectorySnapshot;
}

export interface IFileSystemEventFactory {
  createCreated(
    entry: IDirectorySnapshotEntry,
    root: Directory,
    timestampUtcMs: number
  ): FileSystemEvent;

  createModified(
    entry: IDirectorySnapshotEntry,
    root: Directory,
    timestampUtcMs: number
  ): FileSystemEvent;

  createDeleted(
    entry: IDirectorySnapshotEntry,
    root: Directory,
    timestampUtcMs: number
  ): FileSystemEvent;
}

export interface IFileSystemDiffEngine {
  diff(
    previous: IDirectorySnapshot,
    next: IDirectorySnapshot,
    root: Directory,
    timestampUtcMs: number
  ): ReadonlyArray<FileSystemEvent>;
}

export interface ITimer {
  start(intervalMs: number, callback: ITimerCallback): void;
  stop(): void;
}

export interface ITimerCallback {
  invoke(): void;
}

export interface IDiagnostics {
  failedToReadDirectory(path: Path, error: unknown): void;
  failedToStatPath(path: Path, error: unknown): void;
  pollingScanFailed(path: Path, error: unknown): void;
  observerFailed(event: FileSystemEvent, error: unknown): void;
}

export class PollingDirectoryWatcherOptions {
  public constructor(
    public readonly intervalMs: number = 250,
    public readonly recursive: boolean = false
  ) {
    if (intervalMs <= 0) {
      throw new Error("PollingDirectoryWatcherOptions.intervalMs must be greater than 0.");
    }
  }
}

// ============================================================================
// Core Value Objects
// ============================================================================

export class Path {
  public readonly full: string;

  public constructor(full: string) {
    this.full = nodePath.resolve(full);
  }

  public static from(...segments: string[]): Path {
    return new Path(nodePath.resolve(...segments));
  }

  public join(...segments: string[]): Path {
    return new Path(nodePath.join(this.full, ...segments));
  }

  public get basename(): string {
    return nodePath.basename(this.full);
  }

  public get extension(): string {
    return nodePath.extname(this.full);
  }

  public get parent(): Path {
    return new Path(nodePath.dirname(this.full));
  }

  public exists(fileSystem: IFileSystem = new NodeFileSystem()): boolean {
    return fileSystem.exists(this.full);
  }

  public relativeTo(root: Path): string {
    return nodePath.relative(root.full, this.full);
  }

  public equals(other: Path): boolean {
    return this.full === other.full;
  }

  public toString(): string {
    return this.full;
  }
}

// ============================================================================
// Infrastructure
// ============================================================================

export class NodeFileSystem implements IFileSystem {
  public exists(path: string): boolean {
    return fs.existsSync(path);
  }

  public mkdir(path: string, recursive: boolean): void {
    fs.mkdirSync(path, { recursive });
  }

  public rm(path: string, recursive: boolean, force: boolean): void {
    fs.rmSync(path, { recursive, force });
  }

  public readdir(path: string): ReadonlyArray<IFileSystemEntry> {
    return fs.readdirSync(path, { withFileTypes: true }).map((entry) => ({
      name: entry.name,
      isFile: entry.isFile(),
      isDirectory: entry.isDirectory()
    }));
  }

  public readFile(path: string, encoding: BufferEncoding): string {
    return fs.readFileSync(path, encoding);
  }

  public writeFile(path: string, content: string, encoding: BufferEncoding): void {
    fs.writeFileSync(path, content, encoding);
  }

  public unlink(path: string): void {
    fs.unlinkSync(path);
  }

  public stat(path: string): IFileSystemStat {
    const stat = fs.statSync(path);
    return { mtimeMs: stat.mtimeMs };
  }
}

export class SystemClock implements IClock {
  public now(): number {
    return Date.now();
  }
}

export class IntervalTimer implements ITimer {
  private handle: ReturnType<typeof setInterval> | null = null;

  public start(intervalMs: number, callback: ITimerCallback): void {
    this.stop();
    this.handle = setInterval(() => callback.invoke(), intervalMs);
  }

  public stop(): void {
    if (this.handle !== null) {
      clearInterval(this.handle);
      this.handle = null;
    }
  }
}

export class FileSystemDiagnostics implements IDiagnostics {
  public constructor(private readonly logger: ILogger) {}

  public failedToReadDirectory(path: Path, error: unknown): void {
    this.logger.error("Failed to read directory {path}.", {
      path: path.full,
      error
    });
  }

  public failedToStatPath(path: Path, error: unknown): void {
    this.logger.error("Failed to stat path {path}.", {
      path: path.full,
      error
    });
  }

  public pollingScanFailed(path: Path, error: unknown): void {
    this.logger.error("Polling scan failed for root {path}.", {
      path: path.full,
      error
    });
  }

  public observerFailed(event: FileSystemEvent, error: unknown): void {
    this.logger.error("A filesystem observer failed for {eventType} on {path}.", {
      eventType: event.type,
      path: event.path.full,
      error
    });
  }
}

export class NullDiagnostics implements IDiagnostics {
  public failedToReadDirectory(_path: Path, _error: unknown): void {}

  public failedToStatPath(_path: Path, _error: unknown): void {}

  public pollingScanFailed(_path: Path, _error: unknown): void {}

  public observerFailed(_event: FileSystemEvent, _error: unknown): void {}
}

// ============================================================================
// File / Directory
// ============================================================================

export class File {
  public constructor(
    public readonly path: Path,
    private readonly fileSystem: IFileSystem = new NodeFileSystem()
  ) {}

  public read(encoding: BufferEncoding = "utf-8"): string {
    return this.fileSystem.readFile(this.path.full, encoding);
  }

  public write(content: string, encoding: BufferEncoding = "utf-8"): void {
    const parent = this.path.parent;
    if (!parent.exists(this.fileSystem)) {
      this.fileSystem.mkdir(parent.full, true);
    }

    this.fileSystem.writeFile(this.path.full, content, encoding);
  }

  public delete(): void {
    if (!this.exists()) {
      return;
    }

    this.fileSystem.unlink(this.path.full);
  }

  public exists(): boolean {
    return this.fileSystem.exists(this.path.full);
  }
}

export class Directory {
  public constructor(
    public readonly path: Path,
    private readonly fileSystem: IFileSystem = new NodeFileSystem()
  ) {}

  public exists(): boolean {
    return this.fileSystem.exists(this.path.full);
  }

  public create(recursive: boolean = true): void {
    this.fileSystem.mkdir(this.path.full, recursive);
  }

  public delete(recursive: boolean = true): void {
    if (!this.exists()) {
      return;
    }

    this.fileSystem.rm(this.path.full, recursive, true);
  }

  public listFiles(): ReadonlyArray<File> {
    if (!this.exists()) {
      return [];
    }

    return this.fileSystem
      .readdir(this.path.full)
      .filter((entry) => entry.isFile)
      .map((entry) => new File(this.path.join(entry.name), this.fileSystem));
  }

  public listDirs(): ReadonlyArray<Directory> {
    if (!this.exists()) {
      return [];
    }

    return this.fileSystem
      .readdir(this.path.full)
      .filter((entry) => entry.isDirectory)
      .map((entry) => new Directory(this.path.join(entry.name), this.fileSystem));
  }
}

// ============================================================================
// Snapshot Model
// ============================================================================

type EntryKind = "file" | "dir";

export class DirectorySnapshotEntry implements IDirectorySnapshotEntry {
  public constructor(
    public readonly path: Path,
    public readonly kind: EntryKind,
    public readonly mtimeMs: number
  ) {}
}

export class DirectorySnapshot implements IDirectorySnapshot {
  private readonly entries: Map<string, IDirectorySnapshotEntry>;

  public constructor(entries?: ReadonlyMap<string, IDirectorySnapshotEntry>) {
    this.entries = new Map(entries ?? []);
  }

  public getEntries(): ReadonlyMap<string, IDirectorySnapshotEntry> {
    return this.entries;
  }
}

// ============================================================================
// Snapshot / Diff
// ============================================================================

export class FileSystemEventFactory implements IFileSystemEventFactory {
  public createCreated(
    entry: IDirectorySnapshotEntry,
    root: Directory,
    timestampUtcMs: number
  ): FileSystemEvent {
    return new FileSystemEvent(
      entry.kind === "dir"
        ? FileSystemEventType.DirectoryCreated
        : FileSystemEventType.FileCreated,
      entry.path,
      entry.path.relativeTo(root.path),
      timestampUtcMs
    );
  }

  public createModified(
    entry: IDirectorySnapshotEntry,
    root: Directory,
    timestampUtcMs: number
  ): FileSystemEvent {
    return new FileSystemEvent(
      FileSystemEventType.FileModified,
      entry.path,
      entry.path.relativeTo(root.path),
      timestampUtcMs
    );
  }

  public createDeleted(
    entry: IDirectorySnapshotEntry,
    root: Directory,
    timestampUtcMs: number
  ): FileSystemEvent {
    return new FileSystemEvent(
      entry.kind === "dir"
        ? FileSystemEventType.DirectoryDeleted
        : FileSystemEventType.FileDeleted,
      entry.path,
      entry.path.relativeTo(root.path),
      timestampUtcMs
    );
  }
}

export class DirectorySnapshotProvider implements IDirectorySnapshotProvider {
  public constructor(
    private readonly fileSystem: IFileSystem,
    private readonly recursive: boolean,
    private readonly diagnostics: IDiagnostics
  ) {}

  public create(root: Directory): IDirectorySnapshot {
    const entries = new Map<string, IDirectorySnapshotEntry>();

    if (!root.exists()) {
      return new DirectorySnapshot(entries);
    }

    this.walk(root.path, entries);
    return new DirectorySnapshot(entries);
  }

  private walk(currentPath: Path, entries: Map<string, IDirectorySnapshotEntry>): void {
    let currentEntries: ReadonlyArray<IFileSystemEntry>;

    try {
      currentEntries = this.fileSystem.readdir(currentPath.full);
    } catch (error) {
      this.diagnostics.failedToReadDirectory(currentPath, error);
      return;
    }

    for (const entry of currentEntries) {
      const entryPath = currentPath.join(entry.name);

      let stat: IFileSystemStat;
      try {
        stat = this.fileSystem.stat(entryPath.full);
      } catch (error) {
        this.diagnostics.failedToStatPath(entryPath, error);
        continue;
      }

      const kind: EntryKind = entry.isDirectory ? "dir" : "file";

      entries.set(
        entryPath.full,
        new DirectorySnapshotEntry(entryPath, kind, stat.mtimeMs)
      );

      if (this.recursive && entry.isDirectory) {
        this.walk(entryPath, entries);
      }
    }
  }
}

export class FileSystemDiffEngine implements IFileSystemDiffEngine {
  public constructor(private readonly eventFactory: IFileSystemEventFactory) {}

  public diff(
    previous: IDirectorySnapshot,
    next: IDirectorySnapshot,
    root: Directory,
    timestampUtcMs: number
  ): ReadonlyArray<FileSystemEvent> {
    const result: FileSystemEvent[] = [];
    const previousEntries = previous.getEntries();
    const nextEntries = next.getEntries();

    for (const [fullPath, nextEntry] of nextEntries) {
      const previousEntry = previousEntries.get(fullPath);

      if (!previousEntry) {
        result.push(this.eventFactory.createCreated(nextEntry, root, timestampUtcMs));
        continue;
      }

      if (
        nextEntry.kind === "file" &&
        previousEntry.kind === "file" &&
        nextEntry.mtimeMs !== previousEntry.mtimeMs
      ) {
        result.push(this.eventFactory.createModified(nextEntry, root, timestampUtcMs));
      }
    }

    for (const [fullPath, previousEntry] of previousEntries) {
      if (!nextEntries.has(fullPath)) {
        result.push(this.eventFactory.createDeleted(previousEntry, root, timestampUtcMs));
      }
    }

    return result;
  }
}

// ============================================================================
// Observer Collection
// ============================================================================

export class ObserverSubscription implements ISubscription {
  public constructor(
    private readonly observers: Set<IFileSystemObserver>,
    private readonly observer: IFileSystemObserver
  ) {}

  public unsubscribe(): void {
    this.observers.delete(this.observer);
  }
}

export class FileSystemObserverCollection {
  private readonly observers = new Set<IFileSystemObserver>();

  public subscribe(observer: IFileSystemObserver): ISubscription {
    this.observers.add(observer);
    return new ObserverSubscription(this.observers, observer);
  }

  public notify(event: FileSystemEvent, diagnostics: IDiagnostics): void {
    for (const observer of this.observers) {
      try {
        observer.onFileSystemEvent(event);
      } catch (error) {
        diagnostics.observerFailed(event, error);
      }
    }
  }
}

// ============================================================================
// Polling Watcher
// ============================================================================

export class PollingDirectoryWatcher implements IFileSystemEmitter, ITimerCallback {
  private readonly observers = new FileSystemObserverCollection();
  private readonly snapshotProvider: IDirectorySnapshotProvider;
  private readonly diffEngine: IFileSystemDiffEngine;
  private readonly diagnostics: IDiagnostics;
  private readonly timer: ITimer;
  private readonly clock: IClock;
  private readonly options: PollingDirectoryWatcherOptions;

  private currentSnapshot: IDirectorySnapshot = new DirectorySnapshot();
  private started = false;
  private scanInProgress = false;

  public constructor(
    private readonly root: Directory,
    options: PollingDirectoryWatcherOptions = new PollingDirectoryWatcherOptions(),
    dependencies?: Readonly<{
      fileSystem?: IFileSystem;
      clock?: IClock;
      timer?: ITimer;
      diagnostics?: IDiagnostics;
      snapshotProvider?: IDirectorySnapshotProvider;
      diffEngine?: IFileSystemDiffEngine;
      eventFactory?: IFileSystemEventFactory;
    }>
  ) {
    const fileSystem = dependencies?.fileSystem ?? new NodeFileSystem();
    this.clock = dependencies?.clock ?? new SystemClock();
    this.timer = dependencies?.timer ?? new IntervalTimer();
    this.diagnostics = dependencies?.diagnostics ?? new NullDiagnostics();
    this.options = options;

    const eventFactory = dependencies?.eventFactory ?? new FileSystemEventFactory();

    this.snapshotProvider =
      dependencies?.snapshotProvider ??
      new DirectorySnapshotProvider(fileSystem, this.options.recursive, this.diagnostics);

    this.diffEngine =
      dependencies?.diffEngine ??
      new FileSystemDiffEngine(eventFactory);
  }

  public subscribe(observer: IFileSystemObserver): ISubscription {
    return this.observers.subscribe(observer);
  }

  public start(): void {
    if (this.started) {
      return;
    }

    if (!this.root.exists()) {
      throw new Error(`PollingDirectoryWatcher root does not exist: '${this.root.path.full}'.`);
    }

    this.currentSnapshot = this.snapshotProvider.create(this.root);
    this.timer.start(this.options.intervalMs, this);
    this.started = true;
  }

  public stop(): void {
    if (!this.started) {
      return;
    }

    this.timer.stop();
    this.scanInProgress = false;
    this.started = false;
  }

  public invoke(): void {
    this.scan();
  }

  private scan(): void {
    if (!this.started || this.scanInProgress) {
      return;
    }

    this.scanInProgress = true;

    try {
      const nextSnapshot = this.snapshotProvider.create(this.root);
      const timestampUtcMs = this.clock.now();
      const events = this.diffEngine.diff(
        this.currentSnapshot,
        nextSnapshot,
        this.root,
        timestampUtcMs
      );

      for (const event of events) {
        this.observers.notify(event, this.diagnostics);
      }

      this.currentSnapshot = nextSnapshot;
    } catch (error) {
      this.diagnostics.pollingScanFailed(this.root.path, error);
    } finally {
      this.scanInProgress = false;
    }
  }
}

// ============================================================================
// Module Composition Root
// ============================================================================

export class CoreFileSystemModule {
  public readonly fileSystem: IFileSystem;
  public readonly clock: IClock;
  public readonly logger: ILogger;
  public readonly diagnostics: IDiagnostics;

  public constructor(
    logger: ILogger = nullLogger,
    fileSystem: IFileSystem = new NodeFileSystem(),
    clock: IClock = new SystemClock()
  ) {
    this.logger = logger;
    this.fileSystem = fileSystem;
    this.clock = clock;
    this.diagnostics = new FileSystemDiagnostics(this.logger);
  }

  public createFile(path: Path): File {
    return new File(path, this.fileSystem);
  }

  public createDirectory(path: Path): Directory {
    return new Directory(path, this.fileSystem);
  }

  public createPollingDirectoryWatcher(
    root: Directory,
    options: PollingDirectoryWatcherOptions = new PollingDirectoryWatcherOptions()
  ): PollingDirectoryWatcher {
    return new PollingDirectoryWatcher(root, options, {
      fileSystem: this.fileSystem,
      clock: this.clock,
      timer: new IntervalTimer(),
      diagnostics: this.diagnostics
    });
  }
}

// ============================================================================
// Optional OOP Null Module
// ============================================================================

export class NullCoreFileSystemModule extends CoreFileSystemModule {
  public constructor() {
    super(nullLogger);
  }
}