import { Directory } from "../Directory.js";
import { FileSystemEvent } from "../Events/FileSystemEvent.js";
import { IFileSystemEmitter, IFileSystemObserver } from "../Events/IFileSystemObserver.js";
 
import { Path } from "../Path.js";
import fs from "fs";

export class PollingDirectoryWatcher implements IFileSystemEmitter {
  private observers = new Set<IFileSystemObserver>();
  private timer: any;
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

  private emit(event: FileSystemEvent) {
    this.observers.forEach(o => o(event));
  }

  private scan(): void {
    const files = fs.readdirSync(this.root.path.full);

    const seen = new Set<string>();

    for (const name of files) {
      const full = this.root.path.join(name).full;
      const stat = fs.statSync(full);
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

      const oldMtime = this.lastSnapshot.get(full)!;
      if (mtime !== oldMtime) {
        this.lastSnapshot.set(full, mtime);
        this.emit({
          type: "file.modified",
          path: full,
          relative: name,
          timestamp: Date.now()
        });
      }
    }

    // Deleted items
    for (const old of [...this.lastSnapshot.keys()]) {
      if (!seen.has(old)) {
        this.lastSnapshot.delete(old);
        const relative = Path.from(old).basename;
        this.emit({
          type: "file.deleted",
          path: old,
          relative,
          timestamp: Date.now()
        });
      }
    }
  }
}
