import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { TimeSchdulerObserver } from './ObjectObjectTimerObserver.js';
import './Srceens/Cave/CaveGameObject.js';
import './GameObjectSubject.js';

@customElement('game-canvas')
export class GameCanvas extends LitElement {
  @property({ attribute: false })
  scheduler?: TimeSchdulerObserver;

  protected render(): unknown {
    return html`
      <h3>Canvas</h3>
      <cave-game-object
        .scheduler=${this.scheduler}
      >
        <game-object-subject
          slot="overlay-start"
          .scheduler=${this.scheduler}
          fill="#60a5fa"
          stroke="#1d4ed8"
          size="50"
          indexOffsetRatio="0"
        ></game-object-subject>
        <game-object-subject
          slot="overlay-center"
          .scheduler=${this.scheduler}
          fill="#facc15"
          stroke="#a16207"
          size="50"
          indexOffsetRatio="0.5"
        ></game-object-subject>
      </cave-game-object>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'game-canvas': GameCanvas;
  }
}
