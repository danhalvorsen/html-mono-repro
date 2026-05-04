import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

export interface MonacoTabItem {
  readonly id: string;
  readonly label: string;
}

export interface MonacoTabChangeEventDetail {
  readonly id: string;
}

@customElement("monaco-tabs")
export class MonacoTabs extends LitElement {
  @property({ attribute: false })
  public items: readonly MonacoTabItem[] = [];

  @property()
  public activeId = "";

  public static override styles = css`
    :host {
      display: block;
    }

    .tabs {
      display: flex;
      gap: 0.45rem;
      flex-wrap: wrap;
    }

    button {
      border: 1px solid #2e426a;
      border-radius: 8px;
      background: #172847;
      color: #b6c8ea;
      padding: 0.4rem 0.7rem;
      font: inherit;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-size: 0.76rem;
    }

    button.active {
      border-color: #4d78c9;
      background: #244a86;
      color: #f1f6ff;
    }
  `;

  public override render() {
    return html`
      <div class="tabs" role="tablist" aria-label="Panel Tabs">
        ${this.items.map((tab) => {
          const active = tab.id === this.activeId;

          return html`
            <button
              type="button"
              role="tab"
              aria-selected=${String(active)}
              class=${active ? "active" : ""}
              @click=${() => this.selectTab(tab.id)}
            >
              ${tab.label}
            </button>
          `;
        })}
      </div>
    `;
  }

  private selectTab(id: string): void {
    if (id === this.activeId) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent<MonacoTabChangeEventDetail>("tab-change", {
        detail: { id },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "monaco-tabs": MonacoTabs;
  }
}
