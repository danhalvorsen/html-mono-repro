export const GitSemanticEventKinds = {
  HeadChanged: "head_changed",
  IndexUpdated: "index_updated",
  BranchRefMoved: "branch_ref_moved",
  TagRefMoved: "tag_ref_moved",
  ObjectStored: "object_stored",
  HeadReflogUpdated: "head_reflog_updated",
  BranchReflogUpdated: "branch_reflog_updated",
  Other: "other",
} as const;

export type GitSemanticEventKind =
  (typeof GitSemanticEventKinds)[keyof typeof GitSemanticEventKinds];