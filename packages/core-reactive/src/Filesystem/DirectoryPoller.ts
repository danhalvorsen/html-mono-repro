import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import type { FileSystemEvent } from "./DirectoryEvent.js";

export class DirectoryPoller {
  private snapshot = new Map<string, string>();

  constructor(
    private readonly root: string,
    private readonly intervalMs: number,
    private readonly emit: (e: FileSystemEvent) => void
  ) {}

  start(): void {
    this.scan();
    setInterval(() => this.scan(), this.intervalMs);
  }

  private scanDir(dir: string, output: Map<string, string>) {
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const full = join(dir, entry);
      const stat = statSync(full);

      if (stat.isDirectory()) {
        this.scanDir(full, output);
      } else {
        const buf = readFileSync(full);
        const hash = createHash("sha1")
          .update(buf)
          .digest("hex");

        output.set(full, hash);
      }
    }
  }

  private scan(): void {
    const next = new Map<string, string>();
    this.scanDir(this.root, next);

    // detect CREATES + MODIFIES
    for (const [file, hash] of Array.from(next.entries())) {
      if (!this.snapshot.has(file)) {
        this.emit({
          type: "file.created",
          file,
          timestamp: Date.now()
        });
      } else if (this.snapshot.get(file) !== hash) {
        this.emit({
          type: "file.modified",
          file,
          timestamp: Date.now()
        });
      }
    }

    // detect DELETES
    for (const oldFile of Array.from(this.snapshot.keys())) {
      if (!next.has(oldFile)) {
        this.emit({
          type: "file.deleted",
          file: oldFile,
          timestamp: Date.now()
        });
      }
    }

    this.snapshot = next;
  }
}
