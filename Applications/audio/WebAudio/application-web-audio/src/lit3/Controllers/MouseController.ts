// Applications/audio/WebAudio/application-web-audio/src/lit3/Controllers/MouseController.ts

import type { ReactiveController, ReactiveControllerHost } from "lit";

import type { DragController } from "./DragController.js";
import type { Point } from "../WebComponents/IDraggable.js";

export class MouseController implements ReactiveController {
  private canvas: HTMLCanvasElement | null = null;

  private readonly onMouseDownBound = (event: MouseEvent): void => {
    this.dragController.onPointerDown(this.toCanvasPoint(event));
  };

  private readonly onMouseMoveBound = (event: MouseEvent): void => {
    this.dragController.onPointerMove(this.toCanvasPoint(event));
  };

  private readonly onMouseUpBound = (): void => {
    this.dragController.onPointerUp();
  };

  private readonly onMouseLeaveBound = (): void => {
    this.dragController.onPointerLeave();
  };

  public constructor(
    private readonly host: ReactiveControllerHost,
    private readonly dragController: DragController,
  ) {
    this.host.addController(this);
  }

  public hostConnected(): void {
    // no-op
  }

  public hostDisconnected(): void {
    this.detach();
  }

  public attach(canvas: HTMLCanvasElement): void {
    if (this.canvas === canvas) {
      return;
    }

    this.detach();
    this.canvas = canvas;

    this.canvas.addEventListener("mousedown", this.onMouseDownBound);
    this.canvas.addEventListener("mousemove", this.onMouseMoveBound);
    this.canvas.addEventListener("mouseup", this.onMouseUpBound);
    this.canvas.addEventListener("mouseleave", this.onMouseLeaveBound);
  }

  public detach(): void {
    if (this.canvas === null) {
      return;
    }

    this.canvas.removeEventListener("mousedown", this.onMouseDownBound);
    this.canvas.removeEventListener("mousemove", this.onMouseMoveBound);
    this.canvas.removeEventListener("mouseup", this.onMouseUpBound);
    this.canvas.removeEventListener("mouseleave", this.onMouseLeaveBound);

    this.canvas = null;
  }

  private toCanvasPoint(event: MouseEvent): Point {
    if (this.canvas === null) {
      return { x: 0, y: 0 };
    }

    const rect = this.canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }
}