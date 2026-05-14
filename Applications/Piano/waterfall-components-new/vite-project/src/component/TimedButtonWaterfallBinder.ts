import { Constants } from "../constants.ts";
import {
  TimedButtonEventName,
  type TimedButtonHoldCancelledDetail,
  type TimedButtonHoldChangedDetail,
  type TimedButtonHoldCompletedDetail,
  type TimedButtonHoldStartedDetail,
} from "./TimedButtonElement.ts";

export interface IGravityFallingColumnReceiver {
  createGavityFallingObjectInColumn(
    columnIndex: number,
    heldMs: number,
  ): void;

  updateGavityFallingObjectHeightInColumn(
    columnIndex: number,
    heldMs: number,
  ): void;

  completeGavityFallingObjectInColumn(
    columnIndex: number,
    heldMs: number,
  ): void;

  cancelGavityFallingObjectInColumn(columnIndex: number): void;
}

export interface IEventBinder {
  bind(): void;
  unbind(): void;
}

export class TimedButtonWaterfallBinder implements IEventBinder {
  private static readonly DefaultColumnIndex: number = 0;

  private readonly timedButton: EventTarget;
  private readonly waterfall: IGravityFallingColumnReceiver;
  private columnIndex: number;

  private isBound: boolean = false;

  public constructor(
    timedButton: EventTarget,
    waterfall: IGravityFallingColumnReceiver,
    columnIndex: number = TimedButtonWaterfallBinder.DefaultColumnIndex,
  ) {
    this.timedButton = timedButton;
    this.waterfall = waterfall;
    this.columnIndex = columnIndex;
  }

  public bind(): void {
    if (this.isBound) {
      return;
    }

    this.timedButton.addEventListener(
      TimedButtonEventName.HoldStarted,
      this.onHoldStarted as EventListener,
    );

    this.timedButton.addEventListener(
      TimedButtonEventName.HoldChanged,
      this.onHoldChanged as EventListener,
    );

    this.timedButton.addEventListener(
      TimedButtonEventName.HoldCompleted,
      this.onHoldCompleted as EventListener,
    );

    this.timedButton.addEventListener(
      TimedButtonEventName.HoldCancelled,
      this.onHoldCancelled as EventListener,
    );

    this.isBound = true;
  }

  public unbind(): void {
    if (!this.isBound) {
      return;
    }

    this.timedButton.removeEventListener(
      TimedButtonEventName.HoldStarted,
      this.onHoldStarted as EventListener,
    );

    this.timedButton.removeEventListener(
      TimedButtonEventName.HoldChanged,
      this.onHoldChanged as EventListener,
    );

    this.timedButton.removeEventListener(
      TimedButtonEventName.HoldCompleted,
      this.onHoldCompleted as EventListener,
    );

    this.timedButton.removeEventListener(
      TimedButtonEventName.HoldCancelled,
      this.onHoldCancelled as EventListener,
    );

    this.isBound = false;
  }

  private readonly onHoldStarted = (
    event: CustomEvent<TimedButtonHoldStartedDetail>,
  ): void => {
    this.columnIndex = this.createRandomColumnIndex();

    this.waterfall.createGavityFallingObjectInColumn(
      this.columnIndex,
      event.detail.heldMs,
    );
  };

  private readonly onHoldChanged = (
    event: CustomEvent<TimedButtonHoldChangedDetail>,
  ): void => {
    this.waterfall.updateGavityFallingObjectHeightInColumn(
      this.columnIndex,
      event.detail.heldMs,
    );
  };

  private readonly onHoldCompleted = (
    event: CustomEvent<TimedButtonHoldCompletedDetail>,
  ): void => {
    this.waterfall.completeGavityFallingObjectInColumn(
      this.columnIndex,
      event.detail.heldMs,
    );
  };

  private readonly onHoldCancelled = (
    _event: CustomEvent<TimedButtonHoldCancelledDetail>,
  ): void => {
    this.waterfall.cancelGavityFallingObjectInColumn(this.columnIndex);
  };
  private createRandomColumnIndex(): number {
    return Math.floor(Math.random() * Constants.numberColumns);
  }
}
