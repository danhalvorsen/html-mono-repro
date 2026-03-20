// ====================================================================================
// FILE: src/range/MirrorRangeBehavior.ts
// ====================================================================================

import { IRangeBehavior } from "./IRangeBehavior.js";

export class MirrorRangeBehavior implements IRangeBehavior {
  public normalize(position: number): number {
    if (!Number.isFinite(position)) {
      throw new Error(`Sample position must be finite. Received '${position}'.`);
    }

    const period = 2;
    const mod = position % period;

    const normalized = mod < 0 ? mod + period : mod;

    return normalized <= 1
      ? normalized
      : 1 - (normalized - 1);
  }
}