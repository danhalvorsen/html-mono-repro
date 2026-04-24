import type { GitSemanticEventKind } from "./GitSemanticEventKind.js";
import { GitRelativePath } from "./GitRelativePath.js";
import { GitTimestampUtc } from "./GitTimestampUtc.js";

export interface GitSemanticEvent {
  readonly timestampUtc: string;
  readonly relativePath: string;
  readonly absolutePath: string;
  readonly kind: GitSemanticEventKind;
  readonly description: string;
}

export function createGitSemanticEvent(args: {
  timestampUtc: string;
  relativePath: string;
  absolutePath: string;
  kind: GitSemanticEventKind;
  description: string;
}): GitSemanticEvent {
  const timestampUtc = GitTimestampUtc.create(args.timestampUtc).toString();
  const relativePath = GitRelativePath.create(args.relativePath).toString();
  const absolutePath = args.absolutePath.trim();
  const description = args.description.trim();

  if (absolutePath.length === 0) {
    throw new Error("GitSemanticEvent.absolutePath cannot be empty.");
  }

  if (description.length === 0) {
    throw new Error("GitSemanticEvent.description cannot be empty.");
  }

  return {
    timestampUtc,
    relativePath,
    absolutePath,
    kind: args.kind,
    description,
  };
}
