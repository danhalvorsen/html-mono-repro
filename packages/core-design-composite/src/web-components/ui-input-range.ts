import { css, html, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { UIElement } from "../core/ui-element.js";

export interface UIInputRangeChangeDetail {
  readonly value: number;
}

@customElement("ui-input-range")
export class UIInputRangeElement extends UIElement {
  @property({ type: String })
  public accessor label = "";

  @property({ type: Number })
  public accessor min = 0;

  @property({ type: Number })
  public accessor max = 100;

  @property({ type: Number })
  public accessor step = 1;

  @property({ type: Number })
  public accessor value = 0;

  public static override styles = css`
    :host {
      display: block;
    }

    .field {
      display: grid;
      gap: 6px;
    }

    .header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
    }

    label {
      color: var(--ui-text-1, #222);
      font-size: 14px;
      font-weight: 600;
    }

    output {
      color: var(--ui-text-2, #555);
      font: 13px/1.3 ui-monospace, SFMono-Regular, Consolas, monospace;
    }

    .controls {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 96px;
      gap: 10px;
      align-items: center;
    }

    input {
      box-sizing: border-box;
      font: inherit;
    }

    input[type="range"] {
      width: 100%;
    }

    input[type="number"] {
      width: 100%;
      padding: 8px;
      border-radius: 6px;
      border: 1px solid var(--ui-border-strong, #aaa);
      background: var(--ui-bg-surface, #fff);
      color: var(--ui-text-1, #222);
    }
  `;

  protected override render(): TemplateResult {
    const value = this.clamp(this.value);

    return html`
      <div class="field">
        <div class="header">
          <label>${this.label}</label>
          <output>${value}</output>
        </div>

        <div class="controls">
          <input
            type="range"
            .min=${String(this.min)}
            .max=${String(this.max)}
            .step=${String(this.step)}
            .value=${String(value)}
            @input=${this.onInput}
          />

          <input
            type="number"
            .min=${String(this.min)}
            .max=${String(this.max)}
            .step=${String(this.step)}
            .value=${String(value)}
            @input=${this.onInput}
          />
        </div>
      </div>
    `;
  }

  private readonly onInput = (event: Event): void => {
    if (!(event.target instanceof HTMLInputElement)) {
      throw new TypeError("Expected HTMLInputElement event target.");
    }

    const parsed = Number(event.target.value);

    if (!Number.isFinite(parsed)) {
      return;
    }

    this.value = this.clamp(parsed);

    this.dispatchEvent(
      new CustomEvent<UIInputRangeChangeDetail>("ui-change", {
        detail: {
          value: this.value,
        },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private clamp(value: number): number {
    if (!Number.isFinite(value)) {
      return this.min;
    }

    if (this.max <= this.min) {
      return this.min;
    }

    return Math.min(this.max, Math.max(this.min, value));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-input-range": UIInputRangeElement;
  }
}
