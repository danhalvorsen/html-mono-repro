export type GitFileChangeKind = "created" | "changed" | "deleted" | "unknown";

export interface GitFileChange {
  readonly timestampUtc: string;
  readonly gitDirectoryPath: string;
  readonly relativePath: string;
  readonly absolutePath: string;
  readonly kind: GitFileChangeKind;
  readonly watcherEventType: string;
}

export type GitSemanticEventKind =
  | "head_changed"
  | "index_updated"
  | "branch_ref_moved"
  | "tag_ref_moved"
  | "object_stored"
  | "head_reflog_updated"
  | "branch_reflog_updated"
  | "other";

export interface GitSemanticEvent {
  readonly timestampUtc: string;
  readonly relativePath: string;
  readonly absolutePath: string;
  readonly kind: GitSemanticEventKind;
  readonly description: string;
}

export function isTransientGitPath(relativePath: string): boolean {
  if (relativePath.endsWith(".lock")) {
    return true;
  }

  if (relativePath === "COMMIT_EDITMSG" || relativePath === "MERGE_MSG" || relativePath === "SQUASH_MSG") {
    return true;
  }

  return false;
}
