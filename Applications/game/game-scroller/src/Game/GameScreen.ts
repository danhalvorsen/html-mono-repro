import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { TimeSchdulerObserver } from './ObjectObjectTimerObserver.js';
import './GameCanvas.js';

@customElement('game-screen')
export class GameScreen extends LitElement {
  @property({ attribute: false })
  scheduler?: TimeSchdulerObserver;

  protected render(): unknown {
    return html`<game-canvas .scheduler=${this.scheduler}></game-canvas>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'game-screen': GameScreen;
  }
}
