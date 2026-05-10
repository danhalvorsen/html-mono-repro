import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { SvgSourceFile } from "../domain/SvgSourceFile.js";
import type { ISvgSourceRepository } from "../ports/ISvgSourceRepository.js";
import { SvgSourceFileNameParser } from "../application/SvgSourceFileNameParser.js";

export class FileSystemSvgSourceRepository implements ISvgSourceRepository {
  public constructor(private readonly parser: SvgSourceFileNameParser) {}

  public async list(sourceDirectory: string): Promise<readonly SvgSourceFile[]> {
    const root = path.resolve(sourceDirectory);
    const files = await this.findSvgFiles(root);

    return files
      .sort((left, right) => left.localeCompare(right))
      .map((absolutePath) => {
        const fileName = path.basename(absolutePath);
        const relativePath = path.relative(root, absolutePath).replaceAll("\\", "/");

        return this.parser.parse(fileName, absolutePath, relativePath);
      });
  }

  public async read(sourceFile: SvgSourceFile): Promise<string> {
    return readFile(sourceFile.absolutePath, "utf8");
  }

  private async findSvgFiles(directory: string): Promise<string[]> {
    const entries = await readdir(directory, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        files.push(...await this.findSvgFiles(fullPath));
        continue;
      }

      if (entry.isFile() && entry.name.toLowerCase().endsWith(".svg")) {
        files.push(fullPath);
      }
    }

    return files;
  }
}