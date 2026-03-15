// Fix 1: tests/fixtures/VexVertexVisualShapeDragFixture.ts
// Remove the bad side-effect import to a file that does not exist.

import { Vector2 } from "@monorepo/core-math";

import { MrDraggable, type VexVertexVisualShape } from "../../../src/index.js";
import { DragTestFixtureBase } from "../../Fixtures/DragTestFixtureBase.js";

export class VexVertexVisualShapeDragFixture extends DragTestFixtureBase {
  public readonly draggable: MrDraggable;
  public readonly vertex: VexVertexVisualShape;

  public constructor(
    options?: Readonly<{
      center?: Vector2;
      radius?: number;
      visible?: boolean;
      draggable?: boolean;
    }>,
  ) {
    super();

    this.draggable = document.createElement("mr-draggable") as MrDraggable;
    this.vertex = document.createElement("mr-vex-vertex-shape") as VexVertexVisualShape;

    this.vertex.center = options?.center ?? new Vector2(80, 90);
    this.vertex.radius = options?.radius ?? 10;
    this.vertex.visible = options?.visible ?? true;
    this.vertex.draggable = options?.draggable ?? true;

    this.draggable.append(this.vertex);
    this.root.append(this.draggable);
  }

  public async initialize(): Promise<this> {
    await this.draggable.updateComplete;
    await this.vertex.updateComplete;
    return this;
  }
}