import type { ReactiveController, ReactiveControllerHost } from "lit";

import type { CanvasObject, CanvasObjectDragContext } from "@monorepo/core-plot-canvas";
import type { MouseController } from "./mouse-controller.js";

export interface DragState {
  readonly phase: "idle" | "pending" | "active";
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
  phase: "idle",
  isActive: false,
  target: null,
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0,
  deltaX: 0,
  deltaY: 0,
};

const dragThreshold = 6;

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
      phase: "pending",
      isActive: false,
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
    if (this.dragState.phase === "idle") {
      return;
    }

    const pointer = this.mouseController.pointer;
    const nextState: DragState = {
      ...this.dragState,
      currentX: pointer.canvasX,
      currentY: pointer.canvasY,
      deltaX: pointer.canvasX - this.dragState.startX,
      deltaY: pointer.canvasY - this.dragState.startY,
    };
    const distance = Math.hypot(nextState.deltaX, nextState.deltaY);

    if (nextState.phase === "pending" && distance >= dragThreshold) {
      this.dragState = {
        ...nextState,
        phase: "active",
        isActive: true,
      };
      this.dragState.target?.onDragStart(this.toDragContext(this.dragState));
    } else if (nextState.phase === "active") {
      this.dragState = nextState;
    } else {
      this.dragState = {
        ...nextState,
        isActive: false,
      };
    }

    if (this.dragState.phase === "active") {
      this.dragState.target?.onDragMove(this.toDragContext(this.dragState));
    }

    this.host.requestUpdate();
  }

  public endDrag(): void {
    if (this.dragState.phase === "idle") {
      return;
    }

    if (this.dragState.phase === "active") {
      this.dragState.target?.onDragEnd(this.toDragContext(this.dragState));
    }

    this.dragState = initialDragState;
    this.host.requestUpdate();
  }

  public cancelDrag(): void {
    if (this.dragState.phase === "idle") {
      return;
    }

    this.dragState.target?.onDragCancel(this.toDragContext(this.dragState));
    this.dragState = initialDragState;
    this.host.requestUpdate();
  }

  private toDragContext(state: DragState): CanvasObjectDragContext {
    return {
      startX: state.startX,
      startY: state.startY,
      currentX: state.currentX,
      currentY: state.currentY,
      deltaX: state.deltaX,
      deltaY: state.deltaY,
    };
  }
}
