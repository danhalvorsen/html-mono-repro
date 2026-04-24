import { watch, type FSWatcher, promises as fs } from "node:fs";
import * as path from "node:path";
import {
  NodeFileSystem as CoreNodeFileSystem,
} from "@monorepo/core-filesystem";
import type {
  IFileSystem,
  IFileSystemEntry,
} from "../../contracts/io/IFileSystem.js";

export class NodeFileSystem implements IFileSystem {
  public constructor(
    private readonly fileSystem: CoreNodeFileSystem = new CoreNodeFileSystem(),
  ) {}

  public async readUtf8File(filePath: string): Promise<string> {
    return this.fileSystem.readFile(filePath, "utf8");
  }

  public async writeUtf8File(filePath: string, content: string): Promise<void> {
    this.fileSystem.writeFile(filePath, content, "utf8");
  }

  public async pathExists(targetPath: string): Promise<boolean> {
    return this.fileSystem.exists(targetPath);
  }

  public async getEntry(targetPath: string): Promise<IFileSystemEntry | null> {
    if (!this.fileSystem.exists(targetPath)) {
      return null;
    }

    try {
      this.fileSystem.readdir(targetPath);
      return { absolutePath: targetPath, isDirectory: true };
    } catch {
      try {
        await fs.access(targetPath);
        return { absolutePath: targetPath, isDirectory: false };
      } catch {
        return null;
      }
    }
  }

  public async readDirectory(directoryPath: string): Promise<readonly IFileSystemEntry[]> {
    const entries = this.fileSystem.readdir(directoryPath);

    return entries.map((entry) => ({
      absolutePath: path.join(directoryPath, entry.name),
      isDirectory: entry.isDirectory,
    }));
  }

  public createWatcher(
    directoryPath: string,
    onEvent: (eventType: string, fileName: string | null) => void,
    onError: (error: unknown) => void,
  ): FSWatcher {
    const watcher = watch(directoryPath, { persistent: true }, (eventType, fileName) => {
      onEvent(eventType, fileName?.toString() ?? null);
    });

    watcher.on("error", onError);
    return watcher;
  }
}