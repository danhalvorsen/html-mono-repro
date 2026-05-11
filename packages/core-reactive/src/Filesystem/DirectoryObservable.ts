import { Subject } from "rxjs";
import { FileChangeFilter } from "./FileChangeFilter.js";
import type { FileSystemEvent } from "./DirectoryEvent.js";
import { DirectoryPoller } from "./DirectoryPoller.js";

export class DirectoryObservable {
  private readonly subject = new Subject<FileSystemEvent>();
  private readonly poller: DirectoryPoller;

  constructor(root: string, intervalMs = 500) {
    this.poller = new DirectoryPoller(root, intervalMs, evt => {
      if (FileChangeFilter.isImportant(evt.file)) {
        this.subject.next(evt);
      }
    });
  }

  start(): void {
    this.poller.start();
  }

  subscribe(fn: (e: FileSystemEvent) => void) {
    return this.subject.subscribe(fn);
  }
}
