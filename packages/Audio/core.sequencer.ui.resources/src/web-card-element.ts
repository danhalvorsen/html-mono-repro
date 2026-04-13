import { LitElement, css, html } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { nothing } from "lit";

import "./tone-label-element.js";

type CardSectionKey = "header" | "main" | "footer";

interface IWebCardSection {
  readonly key: CardSectionKey;
  readonly label: string;
}

const DEFAULT_SECTIONS: readonly IWebCardSection[] = [
  { key: "header", label: "HEADER" },
  { key: "main", label: "MAIN" },
  { key: "footer", label: "FOOTER" },
] as const;

const sectionLabelFillColor = "#2b3038";

export class WebCardElement extends LitElement {
  public static readonly tagName = "web-card";

  public static override properties = {
    headerLabel: { type: String, attribute: "header-label", reflect: true },
    mainLabel: { type: String, attribute: "main-label", reflect: true },
    footerLabel: { type: String, attribute: "footer-label", reflect: true },
    labelWidth: { type: Number, attribute: "label-width", reflect: true },
    labelHeight: { type: Number, attribute: "label-height", reflect: true },
  } as const;

  declare public headerLabel: string;
  declare public mainLabel: string;
  declare public footerLabel: string;
  declare public labelWidth: number;
  declare public labelHeight: number;

  public constructor() {
    super();
    this.headerLabel = "HEADER";
    this.mainLabel = "MAIN";
    this.footerLabel = "FOOTER";
    this.labelWidth = 88;
    this.labelHeight = 24;
  }

  public override render() {
    return html`
      <article class="card" part="card">
        ${repeat(
          this.createSections(),
          ({ key }) => key,
          ({ key, label }) => html`
            <section class="section section-${key}" part=${`section section-${key}`}>
              ${this.renderSectionLabel(label)}
              <div class="section-content" part=${`content content-${key}`}>
                <slot name=${key}></slot>
              </div>
            </section>
          `,
        )}
      </article>
    `;
  }

  private renderSectionLabel(label: string) {
    const normalizedLabel = label.trim();
    if (normalizedLabel.length === 0) {
      return nothing;
    }

    return html`
      <svg-label
        class="section-label"
        .label=${normalizedLabel}
        .buttonWidth=${this.labelWidth}
        .buttonHeight=${this.labelHeight}
        .fillColor=${sectionLabelFillColor}
      ></svg-label>
    `;
  }

  private createSections(): readonly IWebCardSection[] {
    return [
      { key: "header", label: this.headerLabel.trim() },
      { key: "main", label: this.mainLabel.trim() },
      { key: "footer", label: this.footerLabel.trim() },
    ];
  }

  public static override styles = css`
    :host {
      display: block;
      color: var(--web-card-text-color, #e8ecf4);
    }

    .card {
      display: grid;
      gap: 12px;
      padding: 16px;
      border-radius: 12px;
      border: 1px solid var(--web-card-border-color, #2f3c56);
      background: var(--web-card-background, #121620);
      box-sizing: border-box;
    }

    .section {
      display: grid;
      gap: 8px;
      padding: 12px;
      border-radius: 10px;
      border: 1px solid var(--web-card-section-border-color, #2a3248);
      background: var(--web-card-section-background, #0f1420);
    }

    .section-label {
      display: block;
    }

    .section-content {
      min-block-size: 0;
      inline-size: 100%;
      display: grid;
      justify-items: center;
    }

    ::slotted(*) {
      margin: 0;
    }
  `;
}

if (!customElements.get(WebCardElement.tagName)) {
  customElements.define(WebCardElement.tagName, WebCardElement);
}
