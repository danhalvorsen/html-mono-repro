import { mkdir, rm } from "node:fs/promises";
import type { IOutputDirectoryCleaner } from "../ports/IOutputDirectoryCleaner.js";

export class FileSystemOutputDirectoryCleaner implements IOutputDirectoryCleaner {
  public async clean(directoryPath: string): Promise<void> {
    await rm(directoryPath, { recursive: true, force: true });
    await mkdir(directoryPath, { recursive: true });
  }
}