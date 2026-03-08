// packages/core-filesystem/src/Path.ts

import fs from "fs";
import path from "path";

export class Path {
  public constructor(public readonly full: string) {}

  public static from(...segments: string[]): Path {
    return new Path(path.resolve(...segments));
  }

  public join(...segments: string[]): Path {
    return new Path(path.join(this.full, ...segments));
  }

  public get basename(): string {
    return path.basename(this.full);
  }

  public get extension(): string {
    return path.extname(this.full);
  }

  public get parent(): Path {
    return new Path(path.dirname(this.full));
  }

  public exists(): boolean {
    return fs.existsSync(this.full);
  }

  public relativeTo(root: Path): string {
    return path.relative(root.full, this.full);
  }
}