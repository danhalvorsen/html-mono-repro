// src/AsymmetricThreePointShapeMapper.ts

import { EstimateShape } from "@monorepo/core.math.probability";
import type { IBacklogTaskShapeMapper } from "./IBacklogTaskShapeMapper.js";
import type { IBacklogTaskJson } from "./json/IBacklogTaskJson.js";

export class AsymmetricThreePointShapeMapper implements IBacklogTaskShapeMapper {
  public mapTask(task: IBacklogTaskJson): EstimateShape {
    const optimistic = task.estimate.optimistic;
    const mostLikely = task.estimate.mostLikely;
    const pessimistic = task.estimate.pessimistic;

    const leftSpread = mostLikely - optimistic;
    const rightSpread = pessimistic - mostLikely;
    const totalSpread = leftSpread + rightSpread;

    if (leftSpread < 0 || rightSpread < 0 || totalSpread <= 0) {
      throw new RangeError(`Invalid estimate shape for task '${task.id}'.`);
    }

    const optimismBias = (rightSpread - leftSpread) / totalSpread;
    const uncertaintyRatio = totalSpread / Math.max(mostLikely, 1);
    const confidence = Math.max(0.2, Math.min(0.9, 1 - uncertaintyRatio / 3));
    const tailWeight = Math.max(0.5, 1 + uncertaintyRatio);

    return new EstimateShape(confidence, optimismBias, tailWeight);
  }
}