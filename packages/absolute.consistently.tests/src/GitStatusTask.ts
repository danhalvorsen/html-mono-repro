import { execSync } from "child_process";
import path from "path";
import { IWDTask, WatchDogResult } from "./WatchDog.js";

type GitStatusLine = {
  raw: string;
  staged: boolean;
  unstaged: boolean;
  untracked: boolean;
};

function parsePorcelain(output: string): GitStatusLine[] {
  return output
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0)
    .map((line) => {
      const x = line[0];
      const y = line[1];
      const untracked = line.startsWith("??");
      const staged = !untracked && x !== " ";
      const unstaged = !untracked && y !== " ";
      return { raw: line, staged, unstaged, untracked };
    });
}

export class GitStatusTask implements IWDTask {
  constructor(private readonly cwd: string = process.cwd()) {}

  async check(): Promise<WatchDogResult> {
    let output: string;
    try {
      output = execSync("git status --porcelain", {
        cwd: this.cwd,
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "pipe"]
      });
    } catch (err) {
      const msg = (err as Error).message ?? "unknown git error";
      return { ok: false, reasons: [`git status failed: ${msg}`] };
    }

    const entries = parsePorcelain(output);
    const staged = entries.filter((e) => e.staged && !e.untracked);
    const unstaged = entries.filter((e) => e.unstaged && !e.untracked);
    const untracked = entries.filter((e) => e.untracked);

    const reasons: string[] = [];
    if (staged.length) reasons.push(`staged changes present (${staged.length})`);
    if (unstaged.length) reasons.push(`unstaged changes present (${unstaged.length})`);
    if (untracked.length) reasons.push(`untracked files present (${untracked.length})`);

    return reasons.length ? { ok: false, reasons } : { ok: true };
  }
}
