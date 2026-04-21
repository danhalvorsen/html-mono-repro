import * as fs from "node:fs/promises";
import * as path from "node:path";
import { spawnSync } from "node:child_process";

export class GitRepo {
  public constructor(public readonly rootPath: string) {}

  public initialize(): void {
    this.run("init");
    this.run("config", "user.email", "integration@test.local");
    this.run("config", "user.name", "Integration Test");
  }

  public run(...args: readonly string[]): string {
    const result = spawnSync("git", ["-C", this.rootPath, ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      shell: false,
    });

    if (result.status !== 0) {
      throw new Error(
        [
          "Git command failed.",
          `cwd: ${this.rootPath}`,
          `args: ${args.join(" ")}`,
          "stdout:",
          result.stdout,
          "stderr:",
          result.stderr,
        ].join("\n"),
      );
    }

    return result.stdout.trim();
  }

  public async writeFile(relativePath: string, content: string | Uint8Array): Promise<void> {
    const absolutePath = path.join(this.rootPath, relativePath);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, content);
  }

  public currentBranch(): string {
    return this.run("branch", "--show-current");
  }

  public headSha(): string {
    return this.run("rev-parse", "HEAD");
  }

  public parentSha(revision = "HEAD^"): string {
    return this.run("rev-parse", revision);
  }
}
