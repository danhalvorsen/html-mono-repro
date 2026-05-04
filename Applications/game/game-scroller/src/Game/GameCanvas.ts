import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { TimeSchdulerObserver } from './ObjectObjectTimerObserver.js';
import './Srceens/Cave/CaveGameObject.js';
 
@customElement('game-canvas')
export class GameCanvas extends LitElement {
  @property({ attribute: false })
  scheduler?: TimeSchdulerObserver;

  protected render(): unknown {
    return html`<h3>Canvas</h3><cave-game-object .scheduler=${this.scheduler}></cave-game-object>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'game-canvas': GameCanvas;
  }
}
