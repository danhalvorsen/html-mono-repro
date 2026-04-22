export const GitWatcherEventTypes = {
  Change: "change",
  Rename: "rename",
  Unknown: "unknown",
} as const;

export type GitWatcherEventType =
  (typeof GitWatcherEventTypes)[keyof typeof GitWatcherEventTypes];

