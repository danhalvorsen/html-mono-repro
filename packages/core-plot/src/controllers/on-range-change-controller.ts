import type { ReactiveController, ReactiveControllerHost } from "lit";

import { AxisIntervalScaler } from "../coordinates/axis-interval-scaler.js";
import { Axis } from "../coordinates/axis.js";
import type { DragController } from "./drag-controller.js";

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
    if (!(dragState.target instanceof Axis) || dragState.isActive === false) {
      this.reset();
      return;
    }

    if (this.activeAxisId !== dragState.target.id) {
      this.activeAxisId = dragState.target.id;
      this.dragStartMin = dragState.target.getRange().min;
      this.dragStartMax = dragState.target.getRange().max;
    }

    const nextRange = this.scaler.scaleFromHorizontalDrag(
      dragState.target.createWorkingRange(this.dragStartMin, this.dragStartMax),
      dragState.deltaX,
    );
    dragState.target.getRange().set(nextRange.min, nextRange.max);
    this.host.requestUpdate();
  }

  public endRangeChange(): void {
    this.reset();
  }

  public cancelRangeChange(): void {
    const dragState = this.dragController.state;
    if (dragState.target instanceof Axis && this.activeAxisId === dragState.target.id) {
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
