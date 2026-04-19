import type { ReactiveController, ReactiveControllerHost } from "lit";

import { AxisIntervalScaler } from "../coordinates/axis-interval-scaler.js";
import type { DragController } from "./drag-controller.js";
import type { CanvasObject } from "@monorepo/core-plot-canvas";

interface AxisRangeMutableLike {
  readonly min: number;
  readonly max: number;

  set(min: number, max: number): void;
  span(): number;
}

interface AxisLike extends CanvasObject {
  getRange(): AxisRangeMutableLike;
  createWorkingRange(min: number, max: number): AxisRangeMutableLike;
}

function isAxisLike(target: CanvasObject | null): target is AxisLike {
  return target !== null &&
    typeof (target as AxisLike).getRange === "function" &&
    typeof (target as AxisLike).createWorkingRange === "function";
}

export class OnRangeChangeController implements ReactiveController {
  private readonly host: ReactiveControllerHost & HTMLElement;
  private readonly dragController: DragController;
  private readonly scaler: AxisIntervalScaler;
  private activeAxisId: string | null = null;
  private dragStartMin = 0;
  private dragStartMax = 0;

  public constructor(
    host: ReactiveControllerHost & HTMLElement,
    dragController: DragController,
    scaler = new AxisIntervalScaler(),
  ) {
    this.host = host;
    this.dragController = dragController;
    this.scaler = scaler;
    this.host.addController(this);
  }

  public hostConnected(): void {}

  public hostDisconnected(): void {}

  public applyActiveRangeChange(): void {
    const dragState = this.dragController.state;
    if (!isAxisLike(dragState.target) || dragState.isActive === false) {
      this.reset();
      return;
    }

    const axis = dragState.target;
    if (this.activeAxisId !== axis.id) {
      this.activeAxisId = axis.id;
      this.dragStartMin = axis.getRange().min;
      this.dragStartMax = axis.getRange().max;
    }

    const nextRange = this.scaler.scaleFromHorizontalDrag(
      axis.createWorkingRange(this.dragStartMin, this.dragStartMax),
      dragState.deltaX,
    );
    axis.getRange().set(nextRange.min, nextRange.max);
    this.host.requestUpdate();
  }

  public endRangeChange(): void {
    this.reset();
  }

  public cancelRangeChange(): void {
    const dragState = this.dragController.state;
    if (isAxisLike(dragState.target) && this.activeAxisId === dragState.target.id) {
      dragState.target.getRange().set(this.dragStartMin, this.dragStartMax);
      this.host.requestUpdate();
    }

    this.reset();
  }

  private reset(): void {
    this.activeAxisId = null;
    this.dragStartMin = 0;
    this.dragStartMax = 0;
  }
}
