import type { FSWatcher } from "node:fs";

export interface IFileSystemEntry {
  readonly absolutePath: string;
  readonly isDirectory: boolean;
}

export interface IFileSystem {
  readUtf8File(filePath: string): Promise<string>;
  writeUtf8File(filePath: string, content: string): Promise<void>;
  pathExists(targetPath: string): Promise<boolean>;
  getEntry(targetPath: string): Promise<IFileSystemEntry | null>;
  readDirectory(directoryPath: string): Promise<readonly IFileSystemEntry[]>;
  createWatcher(
    directoryPath: string,
    onEvent: (eventType: string, fileName: string | null) => void,
    onError: (error: unknown) => void,
  ): FSWatcher;
}