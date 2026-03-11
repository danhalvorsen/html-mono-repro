import type { ReactiveController, ReactiveControllerHost } from "lit";
import { BoundingBox2D } from "@monorepo/core-math";

import type { IShape } from "../WebComponents/Shapes/IShape.js";    

export class OnResizeController implements ReactiveController {

  private previous: BoundingBox2D;

  constructor(
    private host: ReactiveControllerHost,
    private shape: IShape
  ) {

    if (!shape)
      throw new Error("OnResizeController requires a shape.");

    host.addController(this);

    this.previous = shape.getBoundingBox();
  }

  hostConnected(): void {
    this.previous = this.shape.getBoundingBox();
  }

  refresh(): void {

    const current = this.shape.getBoundingBox();

    const prevW = Math.max(1, this.previous.width());
    const prevH = Math.max(1, this.previous.height());

    const sx = current.width() / prevW;
    const sy = current.height() / prevH;

    const min = this.previous.min;

    const nextBounds = new BoundingBox2D(
      min,
      {
        x: min.x + prevW * sx,
        y: min.y + prevH * sy,
      } as any
    );

    this.shape.setBoundingBox(nextBounds);

    this.previous = nextBounds;

    this.host.requestUpdate();
  }
}