import { Point2 } from "@monorepo/core-math";
 
// Optional: strongly-typed ordered array (single fetch)

export type AdsrPointsRecord = Readonly<Record<AdsrPointIndex, Point2>>;
export type AdsrPointIndex = typeof AdsrPointKind[keyof typeof AdsrPointKind];
export const AdsrPointKind = {
  Start: "Start",
  Attack: "Attack",
  Decay: "Decay",
  Sustain: "Sustain",
  End: "End",
} as const;