import type { GitFileChangeKind } from "./GitFileChangeKind.js";
import { GitRelativePath } from "./GitRelativePath.js";
import { GitTimestampUtc } from "./GitTimestampUtc.js";
import type { GitWatcherEventType } from "./GitWatcherEventType.js";

export interface GitFileChange {
  readonly timestampUtc: string;
  readonly gitDirectoryPath: string;
  readonly relativePath: string;
  readonly absolutePath: string;
  readonly kind: GitFileChangeKind;
  readonly watcherEventType: GitWatcherEventType;
}

export function createGitFileChange(args: {
  timestampUtc: string;
  gitDirectoryPath: string;
  relativePath: string;
  absolutePath: string;
  kind: GitFileChangeKind;
  watcherEventType: GitWatcherEventType;
}): GitFileChange {
  const timestampUtc = GitTimestampUtc.create(args.timestampUtc).toString();
  const relativePath = GitRelativePath.create(args.relativePath).toString();

  const gitDirectoryPath = args.gitDirectoryPath.trim();
  const absolutePath = args.absolutePath.trim();

  if (gitDirectoryPath.length === 0) {
    throw new Error("GitFileChange.gitDirectoryPath cannot be empty.");
  }

  if (absolutePath.length === 0) {
    throw new Error("GitFileChange.absolutePath cannot be empty.");
  }

  return {
    timestampUtc,
    gitDirectoryPath,
    relativePath,
    absolutePath,
    kind: args.kind,
    watcherEventType: args.watcherEventType,
  };
}
