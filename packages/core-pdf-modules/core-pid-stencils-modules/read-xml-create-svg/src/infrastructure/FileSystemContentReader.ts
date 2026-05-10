import { readFile } from "node:fs/promises";
import type { IFileContentReader } from "../ports/IFileContentReader.js";

export class FileSystemContentReader implements IFileContentReader {
  public async read(path: string): Promise<string> {
    return readFile(path, "utf8");
  }
}