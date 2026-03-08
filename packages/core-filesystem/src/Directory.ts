// packages/core-filesystem/src/Directory.ts

import fs from "fs";
import { File } from "./File.js";
import { Path } from "./Path.js";

export class Directory {
  public constructor(public readonly path: Path) {}

  public exists(): boolean {
    return this.path.exists();
  }

  public create(recursive: boolean = true): void {
    fs.mkdirSync(this.path.full, { recursive });
  }

  public delete(recursive: boolean = true): void {
    if (!this.exists()) {
      return;
    }

    fs.rmSync(this.path.full, { recursive, force: true });
  }

  public listFiles(): ReadonlyArray<File> {
    if (!this.exists()) {
      return [];
    }

    return fs
      .readdirSync(this.path.full, { withFileTypes: true })
      .filter(entry => entry.isFile())
      .map(entry => new File(this.path.join(entry.name)));
  }

  public listDirs(): ReadonlyArray<Directory> {
    if (!this.exists()) {
      return [];
    }

    return fs
      .readdirSync(this.path.full, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => new Directory(this.path.join(entry.name)));
  }
}