
import fs from "fs";
import { FileSystemEvent } from "./Events/FileSystemEvent.js";
import { IFileSystemEmitter, IFileSystemObserver } from "./Events/IFileSystemObserver.js";
import { Path } from "./Path.js";

export interface Directory {
  path: Path;
}

export class PollingDirectoryWatcher implements IFileSystemEmitter {
  private observers = new Set<IFileSystemObserver>();
  private timer: NodeJS.Timeout | null = null;
  private lastSnapshot = new Map<string, number>();

  constructor(
    private readonly root: Directory,
    private readonly intervalMs: number = 250
  ) {}

  subscribe(observer: IFileSystemObserver): () => void {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }

  start(): void {
    if (this.timer) return;
    this.scan();
    this.timer = setInterval(() => this.scan(), this.intervalMs);
  }

  stop(): void {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  }

  private emit(event: FileSystemEvent): void {
    for (const o of this.observers) o(event);
  }

  private scan(): void {
    let files: string[] = [];

    try {
      files = fs.readdirSync(this.root.path.full);
    } catch {
      return;
    }

    const seen = new Set<string>();

    for (const name of files) {
      const full = this.root.path.join(name).full;

      let stat: fs.Stats;
      try {
        stat = fs.statSync(full);
      } catch {
        continue;
      }

      const mtime = stat.mtimeMs;
      seen.add(full);

      if (!this.lastSnapshot.has(full)) {
        this.lastSnapshot.set(full, mtime);

        this.emit({
          type: stat.isDirectory() ? "dir.created" : "file.created",
          path: full,
          relative: name,
          timestamp: Date.now()
        });

        continue;
      }

      const old = this.lastSnapshot.get(full)!;
      if (mtime !== old) {
        this.lastSnapshot.set(full, mtime);

        // this.emit({
        //   // type: stat.isDirectory() ? "dir.modified" : "file.modified",
        //   // path: full,
        //   // relative: name,
        //   // timestamp: Date.now()
        // });
      }
    }

    for (const old of this.lastSnapshot.keys()) {
      if (!seen.has(old)) {
        this.lastSnapshot.delete(old);

        const relative = Path.from(old).basename;

        this.emit({
          type: old.endsWith("/") ? "dir.deleted" : "file.deleted",
          path: old,
          relative,
          timestamp: Date.now()
        });
      }
    }
  }
}
