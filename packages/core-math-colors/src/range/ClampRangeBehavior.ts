import type { IRangeBehavior } from "./IRangeBehavior.js";

export class ClampRangeBehavior implements IRangeBehavior {
  public normalize(position: number): number {
    if (!Number.isFinite(position)) {
      throw new Error(`Sample position must be finite. Received '${position}'.`);
    }

    if (position < 0) {
      return 0;
    }

    if (position > 1) {
      return 1;
    }

    return position;
  }
}