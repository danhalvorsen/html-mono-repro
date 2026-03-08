// packages/core-filesystem/src/Reactive/PollingDirectoryWatcher.ts

import fs from "fs";
import path from "path";
import { Directory } from "../Directory.js";
import { FileSystemEvent } from "../Events/FileSystemEvent.js";
import {
  IFileSystemEmitter,
  IFileSystemObserver
} from "../Events/IFileSystemObserver.js";

type EntryKind = "file" | "dir";

interface EntrySnapshot {
  readonly kind: EntryKind;
  readonly mtimeMs: number;
}

export interface PollingDirectoryWatcherOptions {
  readonly intervalMs?: number;
  readonly recursive?: boolean;
}

export class PollingDirectoryWatcher implements IFileSystemEmitter {
  private readonly observers = new Set<IFileSystemObserver>();
  private readonly intervalMs: number;
  private readonly recursive: boolean;
  private timer: NodeJS.Timeout | null = null;
  private snapshot = new Map<string, EntrySnapshot>();
  private started = false;

  public constructor(
    private readonly root: Directory,
    options: PollingDirectoryWatcherOptions = {}
  ) {
    this.intervalMs = options.intervalMs ?? 250;
    this.recursive = options.recursive ?? false;
  }

  public subscribe(observer: IFileSystemObserver): () => void {
    this.observers.add(observer);
    return () => {
      this.observers.delete(observer);
    };
  }

  public start(): void {
    if (this.started) {
      return;
    }

    this.snapshot = this.createSnapshot();
    this.timer = setInterval(() => this.scan(), this.intervalMs);
    this.started = true;
  }

  public stop(): void {
    if (!this.started) {
      return;
    }

    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }

    this.started = false;
  }

  private scan(): void {
    let nextSnapshot: Map<string, EntrySnapshot>;

    try {
      nextSnapshot = this.createSnapshot();
    } catch {
      return;
    }

    const now = Date.now();

    for (const [fullPath, next] of nextSnapshot) {
      const previous = this.snapshot.get(fullPath);

      if (!previous) {
        this.emit({
          type: next.kind === "dir" ? "dir.created" : "file.created",
          path: fullPath,
          relative: this.toRelative(fullPath),
          timestamp: now
        });
        continue;
      }

      if (next.kind === "file" && next.mtimeMs !== previous.mtimeMs) {
        this.emit({
          type: "file.modified",
          path: fullPath,
          relative: this.toRelative(fullPath),
          timestamp: now
        });
      }
    }

    for (const [fullPath, previous] of this.snapshot) {
      if (nextSnapshot.has(fullPath)) {
        continue;
      }

      this.emit({
        type: previous.kind === "dir" ? "dir.deleted" : "file.deleted",
        path: fullPath,
        relative: this.toRelative(fullPath),
        timestamp: now
      });
    }

    this.snapshot = nextSnapshot;
  }

  private emit(event: FileSystemEvent): void {
    for (const observer of this.observers) {
      observer(event);
    }
  }

  private createSnapshot(): Map<string, EntrySnapshot> {
    const result = new Map<string, EntrySnapshot>();
    this.walk(this.root.path.full, result);
    return result;
  }

  private walk(currentPath: string, result: Map<string, EntrySnapshot>): void {
    let entries: fs.Dirent[];

    entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      let stat: fs.Stats;
      try {
        stat = fs.statSync(fullPath);
      } catch {
        continue;
      }

      const kind: EntryKind = entry.isDirectory() ? "dir" : "file";

      result.set(fullPath, {
        kind,
        mtimeMs: stat.mtimeMs
      });

      if (this.recursive && entry.isDirectory()) {
        this.walk(fullPath, result);
      }
    }
  }

  private toRelative(fullPath: string): string {
    return path.relative(this.root.path.full, fullPath);
  }
}