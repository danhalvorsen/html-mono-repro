// packages/core-filesystem/src/File.ts

import fs from "fs";
import { Path } from "./Path.js";

export class File {
  public constructor(public readonly path: Path) {}

  public read(): string {
    return fs.readFileSync(this.path.full, "utf-8");
  }

  public write(content: string): void {
    fs.writeFileSync(this.path.full, content, "utf-8");
  }

  public delete(): void {
    if (!this.exists()) {
      return;
    }

    fs.unlinkSync(this.path.full);
  }

  public exists(): boolean {
    return this.path.exists();
  }
}