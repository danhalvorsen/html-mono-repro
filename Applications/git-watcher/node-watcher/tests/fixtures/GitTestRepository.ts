import * as fs from "node:fs/promises";
import * as path from "node:path";
import { spawnSync } from "node:child_process";

export class GitTestRepository {
  public constructor(public readonly rootPath: string) {}

  public initialize(): void {
    this.git("init");
    this.git("config", "user.email", "integration@test.local");
    this.git("config", "user.name", "Integration Test");
  }

  public async writeFile(relativePath: string, content: string): Promise<void> {
    const absolutePath = path.join(this.rootPath, relativePath);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, content, "utf8");
  }

  public git(...args: readonly string[]): string {
    const result = spawnSync("git", ["-C", this.rootPath, ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      shell: false,
    });

    if (result.status !== 0) {
      throw new Error(
        `Git failed: git -C ${this.rootPath} ${args.join(" ")}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
      );
    }

    return result.stdout.trim();
  }
}
