import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { TimeSchdulerObserver } from '@monorepo/game-design-patterns';
import './GameScreen.js';

@customElement('game-application')
export class GameApplication extends LitElement {
  readonly #scheduler = new TimeSchdulerObserver();

  connectedCallback(): void {
    super.connectedCallback();
    this.#scheduler.start();
  }

  disconnectedCallback(): void {
    this.#scheduler.stop();
    super.disconnectedCallback();
  }

  protected render(): unknown {
    return html`<game-screen .scheduler=${this.#scheduler}></game-screen>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'game-application': GameApplication;
  }
}
