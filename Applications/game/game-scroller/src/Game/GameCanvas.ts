import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import './GameObjectSubject.js';
 
@customElement('game-canvas')
export class GameCanvas extends LitElement {

    protected render(): unknown {
        return html `<h3>Canvas</h3><game-object-subject></game-object-subject>`;    
    }
}

declare global {
  interface HTMLElementTagNameMap {
    'game-canvas': GameCanvas
  }
}
