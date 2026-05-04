import { customElement } from 'lit/decorators.js';
import type { Point2 } from '@monorepo/core-math';
import { GameObjectSubject } from '../Game/GameObjectSubject.js';

export type Vector2 = Point2;

@customElement('rectangle-game-object')
export class RectangleGameObject extends GameObjectSubject {
  public getPosistion(): Vector2 {
    return this.getCurrentPoint() ?? { x: 0, y: 0 };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rectangle-game-object': RectangleGameObject;
  }
}
