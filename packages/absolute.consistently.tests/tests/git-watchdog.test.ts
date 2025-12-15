import fs from "fs";
import os from "os";
import path from "path";
import { execSync } from "child_process";
import { describe, expect, it } from "vitest";
import { GitStatusTask } from "../src/GitStatusTask.js";

const tmpRepo = () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "git-watchdog-"));
  execSync("git init -q", { cwd: dir });
  return dir;
};

describe("GitStatusTask", () => {
  it("passes on clean working tree", async () => {
    const dir = tmpRepo();
    const task = new GitStatusTask(dir);
    const res = await task.check();
    expect(res).toEqual({ ok: true });
  });

  it("fails when staged changes exist", async () => {
    const dir = tmpRepo();
    const file = path.join(dir, "file.txt");
    fs.writeFileSync(file, "hello");
    execSync("git add file.txt", { cwd: dir });

    const task = new GitStatusTask(dir);
    const res = await task.check();
    expect(res.ok).toBe(false);
    expect(res && "reasons" in res ? res.reasons.join(" ") : "").toContain("staged changes");
  });

  it("fails when unstaged or untracked changes exist", async () => {
    const dir = tmpRepo();
    fs.writeFileSync(path.join(dir, "file.txt"), "hello");

    const task = new GitStatusTask(dir);
    const res = await task.check();
    expect(res.ok).toBe(false);
    expect(res && "reasons" in res ? res.reasons.join(" ") : "").toMatch(/untracked files/);
  });
});
