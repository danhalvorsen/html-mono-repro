import { LitElement, css, html, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { MenuItemSelectDetail } from "./menu-item.js";

export interface MenuItem {
  readonly id: string;
  readonly label: string;
}

export interface MenuViewChangeDetail {
  readonly viewId: string;
}

@customElement("menu-wc")
export class MenuWc extends LitElement {
  static styles = css`
    :host {
      display: block;
      border-right: 1px solid #d1d5db;
      padding: 20px 14px;
      background: #f8fafc;
    }

    .menu-title {
      margin: 0 0 14px 0;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #374151;
    }

    .menu-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  `;

  @property({ type: String })
  title = "Menu";

  private onMenuItemSelect(event: Event): void {
    const customEvent = event as CustomEvent<MenuItemSelectDetail>;
    const { viewId } = customEvent.detail;
    this.dispatchEvent(
      new CustomEvent<MenuViewChangeDetail>("view-change", {
        detail: { viewId },
        bubbles: true,
        composed: true
      })
    );
  }

  protected render(): TemplateResult {
    return html`
      <h1 class="menu-title">${this.title}</h1>
      <nav class="menu-list" @menu-item-select=${this.onMenuItemSelect}>
        <slot></slot>
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "menu-wc": MenuWc;
  }
}
