import { Vector2 } from "@monorepo/core-math";
import { DirectionalMovementPlan } from "./GravityFalling.ts";

export interface IHoldDurationMovementPlanFactory {
  create(heldMs: number): DirectionalMovementPlan;
}

export class HoldDurationMovementPlanFactory
  implements IHoldDurationMovementPlanFactory
{
  private static readonly MinSpeedPixelsPerSecond = 0;
  private static readonly MaxSpeedPixelsPerSecond = 800;
  private static readonly SpeedPixelsPerSecondPerMillisecond = 0.8;
  private static readonly AccelerationPixelsPerSecondSquared = 320;

  public create(heldMs: number): DirectionalMovementPlan {
    const safeHeldMs = Number.isFinite(heldMs) ? Math.max(0, heldMs) : 0;

    return new DirectionalMovementPlan(
      new Vector2(0, 1),
      this.calculateInitialSpeed(safeHeldMs),
      HoldDurationMovementPlanFactory.AccelerationPixelsPerSecondSquared,
    );
  }

  private calculateInitialSpeed(heldMs: number): number {
    const speed =
      heldMs *
      HoldDurationMovementPlanFactory.SpeedPixelsPerSecondPerMillisecond;

    return Math.min(
      HoldDurationMovementPlanFactory.MaxSpeedPixelsPerSecond,
      Math.max(
        HoldDurationMovementPlanFactory.MinSpeedPixelsPerSecond,
        speed,
      ),
    );
  }
}
