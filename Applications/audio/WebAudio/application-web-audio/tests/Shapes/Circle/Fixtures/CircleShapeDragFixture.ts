// Applications/audio/WebAudio/application-web-audio/tests/fixtures/CircleShapeDragFixture.ts

import { Vector2 } from "@monorepo/core-math";

import { CircleShape, MrDraggable } from "../../../../src/index.js";
import { DragTestFixtureBase } from "../../../Fixtures/DragTestFixtureBase.js";

export class CircleShapeDragFixture extends DragTestFixtureBase {
  public readonly draggable: MrDraggable;
  public readonly circle: CircleShape;

  public constructor(
    options?: Readonly<{
      center?: Vector2;
      radius?: number;
    }>,
  ) {
    super();

    this.draggable = document.createElement("mr-draggable") as MrDraggable;
    this.circle = document.createElement("mr-circle-shape") as CircleShape;

    this.circle.center = options?.center ?? new Vector2(80, 90);
    this.circle.radius = options?.radius ?? 10;

    this.draggable.append(this.circle);
    this.root.append(this.draggable);
  }

  public async initialize(): Promise<this> {
    await customElements.whenDefined("mr-draggable");
    await customElements.whenDefined("mr-circle-shape");

    await this.draggable.updateComplete;
    await this.circle.updateComplete;

    await this.flush();
    await this.draggable.updateComplete;
    await this.circle.updateComplete;

    return this;
  }
}