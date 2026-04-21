import { describe, expect, it } from "vitest";
import type { GitFileChange, GitSemanticEvent } from "../../src/domain/GitDomain.js";
import {
  GitSemanticEventClassifier,
  type IGitSemanticEventRule,
  type ITransientGitPathPolicy,
} from "../../src/Features/semantic-events/GitSemanticEventClassifier.js";

class GitFileChangeFixture {
  public create(relativePath: string): GitFileChange {
    return {
      timestampUtc: "2026-04-21T00:00:00.000Z",
      gitDirectoryPath: "/repo/.git",
      relativePath,
      absolutePath: `/repo/.git/${relativePath}`,
      kind: "changed",
      watcherEventType: "change",
    };
  }
}

class AllowAllTransientPathPolicy implements ITransientGitPathPolicy {
  public isTransient(_relativePath: string): boolean {
    return false;
  }
}

class HeadOnlyRule implements IGitSemanticEventRule {
  public classify(change: GitFileChange): readonly GitSemanticEvent[] {
    if (change.relativePath !== "HEAD") {
      return [];
    }

    return [
      {
        timestampUtc: change.timestampUtc,
        relativePath: change.relativePath,
        absolutePath: change.absolutePath,
        kind: "head_changed",
        description: "head-only",
      },
    ];
  }
}

class FallbackRule implements IGitSemanticEventRule {
  public classify(change: GitFileChange): readonly GitSemanticEvent[] {
    return [
      {
        timestampUtc: change.timestampUtc,
        relativePath: change.relativePath,
        absolutePath: change.absolutePath,
        kind: "other",
        description: "fallback",
      },
    ];
  }
}

describe("GitSemanticEventClassifier", () => {
  const fixture = new GitFileChangeFixture();

  it("should ignore transient git paths", () => {
    const classifier = new GitSemanticEventClassifier();
    const events = classifier.classify(fixture.create("index.lock"));

    expect(events).toEqual([]);
  });

  it("should classify HEAD changes", () => {
    const classifier = new GitSemanticEventClassifier();
    const events = classifier.classify(fixture.create("HEAD"));

    expect(events).toHaveLength(1);
    expect(events[0]?.kind).toBe("head_changed");
    expect(events[0]?.description).toBe("HEAD changed");
  });

  it("should classify branch ref moves", () => {
    const classifier = new GitSemanticEventClassifier();
    const events = classifier.classify(fixture.create("refs/heads/main"));

    expect(events).toHaveLength(1);
    expect(events[0]?.kind).toBe("branch_ref_moved");
  });

  it("should use fallback rule when no rule matches", () => {
    const classifier = new GitSemanticEventClassifier(
      new AllowAllTransientPathPolicy(),
      [new HeadOnlyRule()],
      new FallbackRule(),
    );
    const events = classifier.classify(fixture.create("unknown/path"));

    expect(events).toHaveLength(1);
    expect(events[0]?.kind).toBe("other");
    expect(events[0]?.description).toBe("fallback");
  });
});
