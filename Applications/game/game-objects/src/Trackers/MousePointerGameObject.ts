import { Vector2 } from "@monorepo/core-math";
import { RectangleGameObject } from "../RectangleGameObjects.js";

export class MousePointerGameObject extends RectangleGameObject {
  public trackWindowPointer = true;

  public constructor() {
    super();
    this.size = 30;
    this.fill = "#f97316";
    this.stroke = "#7c2d12";
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    globalThis.addEventListener("pointermove", this.onPointerMove);
  }

  public override disconnectedCallback(): void {
    globalThis.removeEventListener("pointermove", this.onPointerMove);
    super.disconnectedCallback();
  }

  private readonly onPointerMove = (event: Event): void => {
    if (!this.trackWindowPointer || !(event instanceof PointerEvent)) {
      return;
    }

    this.setPosistion(new Vector2(event.clientX, event.clientY));
  };
}
