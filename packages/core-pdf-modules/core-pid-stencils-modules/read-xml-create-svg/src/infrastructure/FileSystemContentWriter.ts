import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { IFileContentWriter } from "../ports/IFileContentWriter.js";

export class FileSystemContentWriter implements IFileContentWriter {
  public async write(path: string, content: string): Promise<void> {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, content, "utf8");
  }
}