// packages/core-filesystem/src/Events/FileSystemEventType.ts

export type FileSystemEventType =
  | "file.created"
  | "file.modified"
  | "file.deleted"
  | "dir.created"
  | "dir.deleted";