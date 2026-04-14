import type { ReactiveController, ReactiveControllerHost } from "lit";

import type { CanvasObject } from "../core/canvas-object.js";
import type { MouseController } from "./mouse-controller.js";

export interface DragState {
  readonly isActive: boolean;
  readonly target: CanvasObject | null;
  readonly startX: number;
  readonly startY: number;
  readonly currentX: number;
  readonly currentY: number;
  readonly deltaX: number;
  readonly deltaY: number;
}

const initialDragState: DragState = {
  isActive: false,
  target: null,
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0,
  deltaX: 0,
  deltaY: 0,
};

export class DragController implements ReactiveController {
  private readonly host: ReactiveControllerHost & HTMLElement;
  private readonly mouseController: MouseController;
  private dragState: DragState = initialDragState;

  public constructor(
    host: ReactiveControllerHost & HTMLElement,
    mouseController: MouseController,
  ) {
    this.host = host;
    this.mouseController = mouseController;
    this.host.addController(this);
  }

  public hostConnected(): void {}

  public hostDisconnected(): void {}

  public get state(): DragState {
    return this.dragState;
  }

  public startDrag(target: CanvasObject): void {
    const pointer = this.mouseController.pointer;

    this.dragState = {
      isActive: true,
      target,
      startX: pointer.canvasX,
      startY: pointer.canvasY,
      currentX: pointer.canvasX,
      currentY: pointer.canvasY,
      deltaX: 0,
      deltaY: 0,
    };

    this.host.requestUpdate();
  }

  public updateDrag(): void {
    if (!this.dragState.isActive) {
      return;
    }

    const pointer = this.mouseController.pointer;
    this.dragState = {
      ...this.dragState,
      currentX: pointer.canvasX,
      currentY: pointer.canvasY,
      deltaX: pointer.canvasX - this.dragState.startX,
      deltaY: pointer.canvasY - this.dragState.startY,
    };

    this.host.requestUpdate();
  }

  public endDrag(): void {
    if (!this.dragState.isActive) {
      return;
    }

    this.dragState = initialDragState;
    this.host.requestUpdate();
  }
}
