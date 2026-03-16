// src/lit3/Controllers/MouseController.ts

import { Vector2 } from "@monorepo/core-math";
import type { DragController } from "./DragController.js";

export class MouseController {

  private canvas: HTMLCanvasElement | null = null;

  public constructor(
    private readonly host: HTMLElement,
    private readonly dragController: DragController,
  ) {}

  public attach(canvas: HTMLCanvasElement): void {

    this.canvas = canvas;

    console.log("[MouseController] attach", canvas);

    canvas.addEventListener("pointerdown", this.onPointerDown);
    canvas.addEventListener("pointermove", this.onPointerMove);
    canvas.addEventListener("pointerup", this.onPointerUp);
    canvas.addEventListener("pointerleave", this.onPointerUp);
  }

  public detach(): void {

    if (!this.canvas) {
      return;
    }

    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("pointerup", this.onPointerUp);
    this.canvas.removeEventListener("pointerleave", this.onPointerUp);

    this.canvas = null;
  }

  private readonly onPointerDown = (event: PointerEvent): void => {

    const point = this.getCanvasPoint(event);

    //console.log("[MouseController] pointerdown", point);

    // FIX: DragController now resolves the target itself
    this.dragController.onPointerDown(point);
  };

  private readonly onPointerMove = (event: PointerEvent): void => {

    const point = this.getCanvasPoint(event);

    this.dragController.onPointerMove(point);
  };

  private readonly onPointerUp = (_event: PointerEvent): void => {

    this.dragController.onPointerUp();
  };

  private getCanvasPoint(event: PointerEvent): Vector2 {

    if (!this.canvas) {
      return new Vector2(0, 0);
    }

    const rect = this.canvas.getBoundingClientRect();

    return new Vector2(
      event.clientX - rect.left,
      event.clientY - rect.top,
    );
  }
}