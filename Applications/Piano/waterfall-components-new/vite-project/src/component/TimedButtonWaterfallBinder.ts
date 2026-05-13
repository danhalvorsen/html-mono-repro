import { GravityFallingMovementStrategy } from "../moveable/GravityFallingMovementStrategy.ts";
import {
    TimedButtonEventName,
    type TimedButtonHoldCompletedDetail,
} from "./TimedButtonElement.ts";

export interface IMovementStrategyReceiver {
  addMovementStrategy(strategy: GravityFallingMovementStrategy): void;
}

export interface IEventBinder {
  bind(): void;
  unbind(): void;
}

export class TimedButtonWaterfallBinder implements IEventBinder {
  private readonly timedButton: EventTarget;
  private readonly waterfall: IMovementStrategyReceiver;

  private isBound: boolean = false;

  public constructor(
    timedButton: EventTarget,
    waterfall: IMovementStrategyReceiver,
  ) {
    this.timedButton = timedButton;
    this.waterfall = waterfall;
  }

  public bind(): void {
    if (this.isBound) {
      return;
    }

    this.timedButton.addEventListener(
      TimedButtonEventName.HoldCompleted,
      this.onHoldCompleted as EventListener,
    );

    this.isBound = true;
  }

  public unbind(): void {
    if (!this.isBound) {
      return;
    }

    this.timedButton.removeEventListener(
      TimedButtonEventName.HoldCompleted,
      this.onHoldCompleted as EventListener,
    );

    this.isBound = false;
  }

  private readonly onHoldCompleted = (
    event: CustomEvent<TimedButtonHoldCompletedDetail>,
  ): void => {
    this.waterfall.addMovementStrategy(
      GravityFallingMovementStrategy.createFromHoldDuration(
        event.detail.heldMs,
      ),
    );
  };
}
