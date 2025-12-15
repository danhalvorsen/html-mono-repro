export type FileEventType =
  | "file.created"
  | "file.modified"
  | "file.deleted";

export interface FileSystemEvent {
  type: FileEventType;
  file: string;
  timestamp: number;
}
