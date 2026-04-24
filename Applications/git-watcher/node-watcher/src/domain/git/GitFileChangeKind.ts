export const GitFileChangeKinds = {
  Created: "created",
  Changed: "changed",
  Deleted: "deleted",
  Unknown: "unknown",
} as const;

export type GitFileChangeKind =
  (typeof GitFileChangeKinds)[keyof typeof GitFileChangeKinds];