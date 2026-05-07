// FILE: src/GameObjects/SceneRoot.ts

import { Vector2 } from "@monorepo/core-math";
import { GameObjectSubject } from "../Game/GameObjectSubject.js";

export class SceneRoot extends GameObjectSubject {
  public override getPosistion(): Vector2 {
    const currentPoint = this.getCurrentPoint();

    return currentPoint
      ? new Vector2(currentPoint.x, currentPoint.y)
      : new Vector2(this.positionX, this.positionY);
  }
}