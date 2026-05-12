export const VoiceState = {
  Created: "Created",
  Started: "Started",
  Stopped: "Stopped",
  Disposed: "Disposed",
} as const;

export type VoiceState = typeof VoiceState[keyof typeof VoiceState];