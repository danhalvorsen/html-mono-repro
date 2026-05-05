import { GameObjectSubject } from "../Game/GameObjectSubject";
import type { Vector2 } from "./RectangleGameObjects";

export class SceneRoot extends GameObjectSubject {
  public getPosistion(): Vector2 {
    return this.getCurrentPoint() ?? { x: 0, y: 0 };
  }
}
