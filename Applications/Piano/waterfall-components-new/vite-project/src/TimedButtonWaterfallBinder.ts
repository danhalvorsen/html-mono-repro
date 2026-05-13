import type { DirectionalMovementPlan } from "./GravityFalling.ts";
import type { IHoldDurationMovementPlanFactory } from "./HoldDurationMovementPlanFactory.ts";
import {
  TimedButtonEventName,
  type TimedButtonHoldCompletedDetail,
} from "./TimedButtonElement.ts";

export interface IDirectionalMovementPlanReceiver {
  addDirectionalMovementPlan(movementPlan: DirectionalMovementPlan): void;
}

export interface IEventBinder {
  bind(): void;
  unbind(): void;
}

export class TimedButtonWaterfallBinder implements IEventBinder {
  private readonly timedButton: EventTarget;
  private readonly waterfall: IDirectionalMovementPlanReceiver;
  private readonly movementPlanFactory: IHoldDurationMovementPlanFactory;

  private isBound: boolean = false;

  public constructor(
    timedButton: EventTarget,
    waterfall: IDirectionalMovementPlanReceiver,
    movementPlanFactory: IHoldDurationMovementPlanFactory,
  ) {
    this.timedButton = timedButton;
    this.waterfall = waterfall;
    this.movementPlanFactory = movementPlanFactory;
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
    this.waterfall.addDirectionalMovementPlan(
      this.movementPlanFactory.create(event.detail.heldMs),
    );
  };
}
