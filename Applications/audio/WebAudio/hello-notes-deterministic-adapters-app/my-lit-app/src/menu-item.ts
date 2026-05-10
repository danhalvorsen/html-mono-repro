import { LitElement, css, html, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

export interface MenuItemSelectDetail {
  readonly viewId: string;
}

@customElement("menu-item")
export class MenuItemElement extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .menu-item {
      width: 100%;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      background: #ffffff;
      color: #111111;
      padding: 10px 12px;
      cursor: pointer;
      text-align: left;
    }

    .menu-item.active {
      border-color: #111111;
      background: #e5e7eb;
    }

    .row {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 10px;
    }

    .icon {
      width: 18px;
      min-width: 18px;
      text-align: center;
      opacity: 0.95;
    }

    .title {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `;

  @property({ type: String })
  viewId = "";

  @property({ type: String })
  label = "";

  @property({ type: String })
  icon = "•";

  @property({ attribute: false })
  contentTemplate?: TemplateResult;

  @property({ type: Boolean })
  active = false;

  private onClick(): void {
    this.dispatchEvent(
      new CustomEvent<MenuItemSelectDetail>("menu-item-select", {
        detail: { viewId: this.viewId },
        bubbles: true,
        composed: true
      })
    );
  }

  private renderDefaultContent(): TemplateResult {
    return html`
      <span class="row">
        <span class="icon" aria-hidden="true">${this.icon}</span>
        <span class="title">${this.label}</span>
      </span>
    `;
  }

  protected render(): TemplateResult {
    return html`
      <button
        class="menu-item ${this.active ? "active" : ""}"
        @click=${this.onClick}
        type="button"
      >
        ${this.contentTemplate ?? this.renderDefaultContent()}
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "menu-item": MenuItemElement;
  }
}
