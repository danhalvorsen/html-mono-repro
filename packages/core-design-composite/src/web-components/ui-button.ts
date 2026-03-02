import { html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { UIElement } from "../core/ui-element.js";
import type { ButtonVariant } from "../behavior/button.js";

@customElement("ui-button")
export class UIButtonElement extends UIElement {
  @property({ type: String, reflect: true })
  accessor variant: ButtonVariant = "primary";

  @property({ type: Boolean, reflect: true })
  accessor disabled = false;

  static styles = css`
    :host {
      display: inline-block;
    }

    button {
      all: unset;
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;

      padding: 8px 14px;
      border-radius: 8px;

      font: inherit;
      line-height: 1;
      cursor: pointer;
      user-select: none;

      border: 1px solid var(--ui-border-strong, #aaa);
      transition: filter 0.1s ease-in-out, transform 0.02s ease-in-out;
    }

    button:active {
      transform: translateY(1px);
    }

    button:focus-visible {
      outline: 2px solid var(--ui-primary, #0d6efd);
      outline-offset: 2px;
    }

    :host([disabled]) button {
      cursor: not-allowed;
      opacity: 0.6;
    }

    /* Variants */
    :host([variant="primary"]) button {
      background: var(--ui-primary, #0d6efd);
      color: white;
      border-color: transparent;
    }

    :host([variant="secondary"]) button {
      background: var(--ui-bg-elevated, #f7f7f7);
      color: var(--ui-text-1, #222);
    }

    :host([variant="ghost"]) button {
      background: transparent;
      color: var(--ui-text-1, #222);
      border-color: transparent;
    }

    :host([variant="ghost"]) button:hover {
      filter: brightness(0.95);
    }
  `;

  @property({ type: String, reflect: true })
  accessor label = "";

  private emitClick(e: MouseEvent) {
    if (this.disabled) return;

    this.dispatchEvent(
      new CustomEvent("ui-click", {
        detail: { label: this.label, sourceEvent: e },
        bubbles: true,
        composed: true,
      })
    );
  }

  private onKeyDown(e: KeyboardEvent) {
    if (this.disabled) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.dispatchEvent(
        new CustomEvent("ui-click", {
          detail: { label: this.label, sourceEvent: e },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  render() {
    return html`
      <button
        type="button"
        ?disabled=${this.disabled}
        @click=${(e: MouseEvent) => this.emitClick(e)}
        @keydown=${(e: KeyboardEvent) => this.onKeyDown(e)}
      >
        <slot></slot>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-button": UIButtonElement;
  }
}