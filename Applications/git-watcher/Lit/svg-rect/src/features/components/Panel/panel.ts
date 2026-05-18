// src/features/components/Panel/panel.ts
import { LitElement, html, type TemplateResult, svg } from "lit";
import { customElement } from "lit/decorators.js";

import {
  PANEL_ITEM_RENDERERS,
  type PanelItemTag,
  WEB_CARD_TOGGLE_TAG,
  DUMMY_WEB_CARD_1_TAG,
} from "./panel-items.js";

export const PANEL_TOGGLE_EVENT = "mr-panel-toggle" as const;

@customElement("mr-panel")
export class Panel extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
  };

  open = false;

  private readonly panelId =
    `mr-panel-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}-content`;

  private readonly items: readonly PanelItemTag[] = [
    WEB_CARD_TOGGLE_TAG,
    DUMMY_WEB_CARD_1_TAG,
  ];

  protected override createRenderRoot() {
    return this; // global css
  }

  private readonly togglePanel = () => {
    this.open = !this.open;
    this.dispatchEvent(new Event(PANEL_TOGGLE_EVENT, { bubbles: true, composed: true }));
  };

  override render(): TemplateResult {
    const expanded = this.open ? "true" : "false";

    return html`
      <section class="mr-panel__shell">
        <aside class="mr-panel__icon-rail">
          <button
            class="mr-panel__icon-btn"
            @click=${this.togglePanel}
            aria-expanded=${expanded}
            aria-controls=${this.panelId}
            aria-label="Toggle panel"
            title="Toggle panel"
            type="button"
          >
            ${svg`
              <svg
                class="mr-panel__icon"
                viewBox="0 0 24 24"
                width="20"
                height="20"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  fill="none"
                />
              </svg>
            `}
          </button>
        </aside>

        <div
          class="mr-panel__panel"
          id=${this.panelId}
          aria-hidden=${this.open ? "false" : "true"}
        >
          <div class="mr-panel__header">Sliding Panel MVP</div>

          <div class="mr-panel__content">
            <ul class="mr-panel__list">
              ${this.items.map((tag) => html`
                <li class="mr-panel__item">
                  ${this.#renderCard(tag)}
                </li>
              `)}
            </ul>
          </div>
        </div>
      </section>
    `;
  }

  #renderCard(tag: PanelItemTag): TemplateResult {
    const render = PANEL_ITEM_RENDERERS[tag];
    if (!render) throw new Error(`Panel: no renderer registered for tag "${tag}".`);
    return render();
  }
}