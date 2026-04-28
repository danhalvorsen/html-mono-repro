export const PlaybackState = {
  Idle: "idle",
  Playing: "playing",
  Stopped: "stopped",
} as const;

export type PlaybackStateValue =
  (typeof PlaybackState)[keyof typeof PlaybackState];
