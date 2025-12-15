import { FileSystemEventType } from "./FileSystemEventType.js";

export interface FileSystemEvent {
  type: FileSystemEventType;
  path: string;      // full path
  relative: string;  // relative to watcher root
  timestamp: number; // epoch
}
