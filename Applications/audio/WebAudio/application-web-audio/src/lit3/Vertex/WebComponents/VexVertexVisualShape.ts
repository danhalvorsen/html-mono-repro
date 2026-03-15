import { customElement } from "lit/decorators.js";
import { Vector2 } from "@monorepo/core-math";

import { MrVexCircleShape } from "./MrVexCircleShape.js";

@customElement("mr-vex-vertex-shape")
export class VexVertexVisualShape extends MrVexCircleShape {
  public constructor() {
    super();
    this.center = new Vector2(30, 20);
    this.radius = 6;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "mr-vex-vertex-shape": VexVertexVisualShape;
  }
}
