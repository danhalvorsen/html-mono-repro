import { readFile } from "node:fs/promises";
import path from "node:path";

export interface IJsonMessageReader {
  read(filePath: string): Promise<unknown>;
}

export class FileJsonMessageReader implements IJsonMessageReader {
  public async read(filePath: string): Promise<unknown> {
    const absolutePath = path.resolve(process.cwd(), filePath);
    const content = await readFile(absolutePath, "utf8");

    return JSON.parse(content) as unknown;
  }
}