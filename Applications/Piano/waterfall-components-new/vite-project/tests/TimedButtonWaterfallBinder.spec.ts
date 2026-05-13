// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import {
  TimedButtonEventName,
  type TimedButtonHoldCompletedDetail,
} from "../src/component/TimedButtonElement.ts";
import { GravityFallingMovementStrategy } from "../src/moveable/GravityFallingMovementStrategy.ts";
import { TimedButtonWaterfallBinder } from "../src/component/TimedButtonWaterfallBinder.ts";

class TestMovementStrategyReceiver {
  public readonly receivedStrategies: GravityFallingMovementStrategy[] = [];

  public addMovementStrategy(strategy: GravityFallingMovementStrategy): void {
    this.receivedStrategies.push(strategy);
  }
}

describe("TimedButtonWaterfallBinder", () => {
  it("should add a gravity falling movement strategy when timed button hold completes", () => {
    const timedButton = new EventTarget();
    const receiver = new TestMovementStrategyReceiver();

    const binder = new TimedButtonWaterfallBinder(timedButton, receiver);

    binder.bind();

    timedButton.dispatchEvent(
      new CustomEvent<TimedButtonHoldCompletedDetail>(
        TimedButtonEventName.HoldCompleted,
        {
          detail: { heldMs: 125 },
        },
      ),
    );

    expect(receiver.receivedStrategies).toHaveLength(1);
    expect(receiver.receivedStrategies[0]).toBeInstanceOf(
      GravityFallingMovementStrategy,
    );
    expect(
      receiver.receivedStrategies[0]?.movementPlan.initialSpeedPixelsPerSecond,
    ).toBe(100);
  });

  it("should stop adding movement strategies after unbind", () => {
    const timedButton = new EventTarget();
    const receiver = new TestMovementStrategyReceiver();

    const binder = new TimedButtonWaterfallBinder(timedButton, receiver);

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

    expect(receiver.receivedStrategies).toEqual([]);
  });
});
