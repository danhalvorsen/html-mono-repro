import { FileSystemEvent } from "./FileSystemEvent.js";

export interface IFileSystemObserver {
  (event: FileSystemEvent): void;
}

export interface IFileSystemEmitter {
  subscribe(observer: IFileSystemObserver): () => void;
  start(): void;
  stop(): void;
}