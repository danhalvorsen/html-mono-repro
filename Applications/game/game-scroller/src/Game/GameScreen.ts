import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import './GameCanvas.js';

@customElement('game-screen')
export class GameScreen extends LitElement {
    protected render(): unknown {
        return html `<game-canvas></game-canvas>`;
    }
}

declare global {
  interface HTMLElementTagNameMap {
    'game-screen': GameScreen
  }
}
