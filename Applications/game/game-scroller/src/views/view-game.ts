import { LitElement, html, type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import "../Game/index.js";

@customElement("view-game")
export class ViewGame extends LitElement {
  protected render(): TemplateResult {
    return html`<game-application></game-application>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "view-game": ViewGame;
  }
}

