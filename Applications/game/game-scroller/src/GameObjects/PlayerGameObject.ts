import { customElement } from 'lit/decorators.js';
import type { Point2 } from '@monorepo/core-math';
import { GameObjectSubject } from '../Game/GameObjectSubject.js';

export type Vector2 = Point2;

@customElement('player-game-object')
export class PlayerGameObject extends GameObjectSubject {
  public getPosistion(): Vector2 {
    return this.getCurrentPoint() ?? { x: 0, y: 0 };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'player-game-object': PlayerGameObject;
  }
}
