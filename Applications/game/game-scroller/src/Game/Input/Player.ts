import { customElement } from 'lit/decorators.js';
import { GameObjectSubject } from '../GameObjectSubject';
import { PlayerInput } from './PlayerInput';

@customElement('game-player')
export class Player extends GameObjectSubject {
  readonly #input = new PlayerInput(this);

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
    'game-player': Player;
  }
}
