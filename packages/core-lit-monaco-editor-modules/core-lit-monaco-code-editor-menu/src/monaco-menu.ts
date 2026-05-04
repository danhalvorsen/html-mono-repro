import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("monaco-menu")
export class MonacoMenu extends LitElement {
  public static override styles = css`
    :host {
      --menu-bg: #121e34;
      --menu-border: #2d426f;
      --menu-text: #d9e2f5;

      display: block;
      color: var(--menu-text);
      font-family: "Segoe UI", Tahoma, sans-serif;
    }

    nav {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 0.75rem;
      padding: 0.7rem 0.85rem;
      border: 1px solid var(--menu-border);
      border-radius: 10px;
      background: var(--menu-bg);
    }

    ::slotted(*) {
      display: block;
      width: 100%;
    }

    .meta {
      margin-top: 0.25rem;
      opacity: 0.8;
      font-size: 0.9rem;
      white-space: nowrap;
      align-self: flex-end;
    }
  `;

  public override render() {
    return html`
      <nav>
        <slot name="load"></slot>
        <slot name="save"></slot>
        <slot name="build"></slot>
        <slot name="run"></slot>
        <span class="meta">Monaco Menu</span>
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "monaco-menu": MonacoMenu;
  }
}
