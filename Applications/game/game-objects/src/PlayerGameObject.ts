import { Vector2 } from "@monorepo/core-math";
import { customElement } from "lit/decorators.js";
import { RectangleGameObject } from "./RectangleGameObjects.js";

@customElement("player-game-object")
export class PlayerGameObject extends RectangleGameObject {
  public override getPosistion(): Vector2 {
    const currentPoint = this.getCurrentPoint();

    return currentPoint
      ? new Vector2(currentPoint.x, currentPoint.y)
      : new Vector2(this.positionX, this.positionY);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "player-game-object": PlayerGameObject;
  }
}
