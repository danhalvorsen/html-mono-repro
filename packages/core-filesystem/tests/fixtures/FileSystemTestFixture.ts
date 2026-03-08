// packages/core-filesystem/tests/Fixtures/FileSystemTestFixture.ts

import fs from "fs";
import os from "os";
import path from "path";
import { Directory, Path, File} from "../../src/index.js";

export class FileSystemTestFixture {
  private readonly rootFsPath: string;
  public readonly rootPath: Path;
  public readonly rootDirectory: Directory;

  public constructor() {
    this.rootFsPath = fs.mkdtempSync(path.join(os.tmpdir(), "core-filesystem-"));
    this.rootPath = Path.from(this.rootFsPath);
    this.rootDirectory = new Directory(this.rootPath);
  }

  public createFile(relativePath: string, content: string = ""): File {
    const absolutePath = this.rootPath.join(relativePath);
    fs.mkdirSync(path.dirname(absolutePath.full), { recursive: true });

    const file = new File(absolutePath);
    file.write(content);

    return file;
  }

  public createDirectory(relativePath: string): Directory {
    const directory = new Directory(this.rootPath.join(relativePath));
    directory.create(true);
    return directory;
  }

  public cleanup(): void {
    if (fs.existsSync(this.rootFsPath)) {
      fs.rmSync(this.rootFsPath, { recursive: true, force: true });
    }
  }
}