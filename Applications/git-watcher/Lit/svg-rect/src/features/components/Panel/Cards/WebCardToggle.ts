// src/components/cards/WebCardToggle.ts
import { LitElement, html, type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

import { GRID_TOGGLE_EVENT, type GridToggleDetail } from "../../../../events/grid-events.js";
import { WebCardController } from "./WebCardController.js";

type WebCardParts = {
  title: () => string;
  header: () => TemplateResult;
  main: () => TemplateResult;
  footer: () => TemplateResult;
};

function assertWebCardParts(parts: WebCardParts, ctx: string): void {
  if (!parts || typeof parts !== "object") throw new Error(`${ctx}: parts must be an object.`);
  if (typeof parts.title !== "function") throw new Error(`${ctx}: parts.title must be a function.`);
  if (typeof parts.header !== "function") throw new Error(`${ctx}: parts.header must be a function.`);
  if (typeof parts.main !== "function") throw new Error(`${ctx}: parts.main must be a function.`);
  if (typeof parts.footer !== "function") throw new Error(`${ctx}: parts.footer must be a function.`);

  const title = parts.title();
  if (typeof title !== "string" || title.trim().length === 0) {
    throw new Error(`${ctx}: parts.title() must return a non-empty string.`);
  }

  const header = parts.header();
  const main = parts.main();
  const footer = parts.footer();

  for (const [name, t] of [
    ["header", header],
    ["main", main],
    ["footer", footer],
  ] as const) {
    const anyT = t as unknown as { strings?: unknown; values?: unknown };
    if (!t || typeof t !== "object") throw new Error(`${ctx}: parts.${name}() must return TemplateResult.`);
    if (!Array.isArray(anyT.strings) || !("values" in anyT)) {
      throw new Error(`${ctx}: parts.${name}() is not a valid lit TemplateResult.`);
    }
  }
}

@customElement("mr-web-card-toggle")
export class WebCardToggle extends LitElement {
  enabled = true;

  readonly #groupName =
    `mr-grid-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;

  readonly #card: WebCardController;

  constructor(
    cardFactory: (host: LitElement) => WebCardController =
      (host) => {
        const parts: WebCardParts = {
          title: () => "Grid",
          header: () => html``,
          main: () => this.#buildMain(),
          footer: () => this.#buildFooter(),
        };

        assertWebCardParts(parts, "WebCardToggle");
        return new WebCardController(host, parts);
      }
  ) {
    super();
    this.#card = cardFactory(this);
  }

  protected override createRenderRoot() {
    return this; // global CSS
  }

  override render(): TemplateResult {
    return this.#card.render();
  }

  #buildMain(): TemplateResult {
    return html`
      <fieldset class="mr-grid-toggle">
        <legend class="mr-grid-toggle__legend">Grid</legend>

        <label>
          <input
            type="radio"
            name=${this.#groupName}
            .checked=${this.enabled}
            @change=${() => this.#set(true)}
          />
          On
        </label>

        <label style="margin-left:12px;">
          <input
            type="radio"
            name=${this.#groupName}
            .checked=${!this.enabled}
            @change=${() => this.#set(false)}
          />
          Off
        </label>
      </fieldset>
    `;
  }

  #buildFooter(): TemplateResult {
    return html`
      <small class="mr-card__hint">
        Dispatches <code>${GRID_TOGGLE_EVENT}</code>
      </small>
    `;
  }

  #set(enabled: boolean) {
    if (this.enabled === enabled) return;

    this.enabled = enabled;

    const detail: GridToggleDetail = { enabled };

    window.dispatchEvent(
      new CustomEvent<GridToggleDetail>(GRID_TOGGLE_EVENT, { detail }),
    );

    this.requestUpdate();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "mr-web-card-toggle": WebCardToggle;
  }
}