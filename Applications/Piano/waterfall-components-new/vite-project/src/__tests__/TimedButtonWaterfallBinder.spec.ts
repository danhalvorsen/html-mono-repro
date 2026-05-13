// @vitest-environment jsdom

import { Vector2 } from "@monorepo/core-math";
import { describe, expect, it } from "vitest";

import { DirectionalMovementPlan } from "../GravityFalling.ts";
import type { IHoldDurationMovementPlanFactory } from "../HoldDurationMovementPlanFactory.ts";
import {
  TimedButtonEventName,
  type TimedButtonHoldCompletedDetail,
} from "../TimedButtonElement.ts";
import { TimedButtonWaterfallBinder } from "../TimedButtonWaterfallBinder.ts";

class TestMovementPlanFactory implements IHoldDurationMovementPlanFactory {
  public readonly receivedHoldDurations: number[] = [];

  public create(heldMs: number): DirectionalMovementPlan {
    this.receivedHoldDurations.push(heldMs);

    return new DirectionalMovementPlan(
      new Vector2(0, 1),
      heldMs,
      320,
    );
  }
}

class TestDirectionalMovementPlanReceiver {
  public readonly receivedPlans: DirectionalMovementPlan[] = [];

  public addDirectionalMovementPlan(
    movementPlan: DirectionalMovementPlan,
  ): void {
    this.receivedPlans.push(movementPlan);
  }
}

describe("TimedButtonWaterfallBinder", () => {
  it("should add a directional movement plan when timed button hold completes", () => {
    const timedButton = new EventTarget();
    const receiver = new TestDirectionalMovementPlanReceiver();
    const movementPlanFactory = new TestMovementPlanFactory();

    const binder = new TimedButtonWaterfallBinder(
      timedButton,
      receiver,
      movementPlanFactory,
    );

    binder.bind();

    timedButton.dispatchEvent(
      new CustomEvent<TimedButtonHoldCompletedDetail>(
        TimedButtonEventName.HoldCompleted,
        {
          detail: { heldMs: 125 },
        },
      ),
    );

    expect(movementPlanFactory.receivedHoldDurations).toEqual([125]);
    expect(receiver.receivedPlans).toHaveLength(1);
    expect(receiver.receivedPlans[0]?.direction).toEqual(new Vector2(0, 1));
  });

  it("should stop adding movement plans after unbind", () => {
    const timedButton = new EventTarget();
    const receiver = new TestDirectionalMovementPlanReceiver();
    const movementPlanFactory = new TestMovementPlanFactory();

    const binder = new TimedButtonWaterfallBinder(
      timedButton,
      receiver,
      movementPlanFactory,
    );

    binder.bind();
    binder.unbind();

    timedButton.dispatchEvent(
      new CustomEvent<TimedButtonHoldCompletedDetail>(
        TimedButtonEventName.HoldCompleted,
        {
          detail: { heldMs: 125 },
        },
      ),
    );

    expect(movementPlanFactory.receivedHoldDurations).toEqual([]);
    expect(receiver.receivedPlans).toEqual([]);
  });
});
