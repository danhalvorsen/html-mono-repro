import { customElement } from 'lit/decorators.js';
import { GameObjectSubject } from '../GameObjectSubject.js';
import { PlayerInputController } from './PlayerInputController.js';

const PlayerElementName = 'game-player';

@customElement(PlayerElementName)
export class Player extends GameObjectSubject {
  readonly #input = new PlayerInputController(this);

  public get horizontalAxis(): number {
    return this.#input.horizontalAxis;
  }

  public get verticalAxis(): number {
    return this.#input.verticalAxis;
  }

  public get isFirePressed(): boolean {
    return this.#input.isFirePressed;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [PlayerElementName]: Player;
  }
}