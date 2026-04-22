import { describe, expect, test } from "vitest";
import {
  createGitFileChange,
  createGitSemanticEvent,
  GitRelativePath,
  GitTimestampUtc,
  GitWatcherEventTypes,
  TransientGitPathPolicy,
} from "../../src/domain/git/index.js";

describe("git domain value objects", () => {
  test("GitRelativePath normalizes separators and trims", () => {
    const value = GitRelativePath.create(" refs\\heads\\main ");
    expect(value.toString()).toBe("refs/heads/main");
  });

  test("GitTimestampUtc requires ISO UTC format", () => {
    expect(() => GitTimestampUtc.create("2026-04-22T10:00:00.000Z")).not.toThrow();
    expect(() => GitTimestampUtc.create("2026-04-22T10:00:00.000+01:00")).toThrow();
    expect(() => GitTimestampUtc.create("not-a-date")).toThrow();
  });

  test("createGitFileChange validates and normalizes fields", () => {
    const change = createGitFileChange({
      timestampUtc: "2026-04-22T10:00:00.000Z",
      gitDirectoryPath: " /repo/.git ",
      relativePath: "refs\\heads\\main",
      absolutePath: " /repo/.git/refs/heads/main ",
      kind: "changed",
      watcherEventType: GitWatcherEventTypes.Change,
    });

    expect(change.timestampUtc).toBe("2026-04-22T10:00:00.000Z");
    expect(change.relativePath).toBe("refs/heads/main");
    expect(change.watcherEventType).toBe("change");
  });

  test("createGitSemanticEvent validates and normalizes fields", () => {
    const event = createGitSemanticEvent({
      timestampUtc: "2026-04-22T10:00:00.000Z",
      relativePath: "logs\\HEAD",
      absolutePath: "/repo/.git/logs/HEAD",
      kind: "head_reflog_updated",
      description: "head reflog changed",
    });

    expect(event.relativePath).toBe("logs/HEAD");
    expect(event.description).toBe("head reflog changed");
  });

  test("TransientGitPathPolicy uses normalized relative path value object", () => {
    const policy = new TransientGitPathPolicy();

    expect(policy.isTransient(GitRelativePath.create("index.lock"))).toBe(true);
    expect(policy.isTransient(GitRelativePath.create("COMMIT_EDITMSG"))).toBe(true);
    expect(policy.isTransient(GitRelativePath.create("refs/heads/main"))).toBe(false);
  });
});

