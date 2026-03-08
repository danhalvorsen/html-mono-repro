// packages/core-filesystem/src/Events/FileSystemEvent.ts

import { FileSystemEventType } from "./FileSystemEventType.js";

export interface FileSystemEvent {
  readonly type: FileSystemEventType;
  readonly path: string;
  readonly relative: string;
  readonly timestamp: number;
}