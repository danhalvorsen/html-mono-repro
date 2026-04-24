import * as path from "node:path";
import { spawn, type ChildProcess } from "node:child_process";

export class WatcherHost {
  private process: ChildProcess | null = null;
  private stdout = "";
  private stderr = "";

  public start(projectRoot: string, repoPath: string, graphPath: string): void {
    const command = process.execPath;
    const args = [
      path.join(projectRoot, "node_modules", "tsx", "dist", "cli.mjs"),
      "src/index.ts",
      "--repo",
      repoPath,
      "--graph-json",
      graphPath,
    ];

    this.process = spawn(command, args, {
      cwd: projectRoot,
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
    });

    this.process.stdout?.setEncoding("utf8");
    this.process.stderr?.setEncoding("utf8");
    this.process.stdout?.on("data", (chunk: string) => {
      this.stdout += chunk;
    });
    this.process.stderr?.on("data", (chunk: string) => {
      this.stderr += chunk;
    });
  }

  public ensureRunning(): void {
    if (this.process !== null && this.process.exitCode !== null) {
      throw new Error(
        `Watcher exited early with code ${this.process.exitCode}.\nstdout:\n${this.stdout}\nstderr:\n${this.stderr}`,
      );
    }
  }

  public stop(): void {
    if (this.process !== null && this.process.exitCode === null) {
      this.process.kill("SIGTERM");
    }

    this.process = null;
  }
}
