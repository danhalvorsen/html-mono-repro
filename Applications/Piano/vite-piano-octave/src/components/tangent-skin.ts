import { LitElement, css, html, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

export type TangentSkinTemplate = "none" | "identifier" | "debug";

@customElement("tangent-skin")
export class TangentSkin extends LitElement {
  private static readonly DEFAULT_MARGIN_RATIO = 0.1;
  private static readonly DEFAULT_MAX_TEXT_WIDTH_RATIO = 0.8;

  public static override styles = css`
    :host {
      position: absolute;
      inset: 0;
      display: block;
      box-sizing: border-box;
      pointer-events: none;
      user-select: none;
      font-family: "Segoe UI", system-ui, sans-serif;
    }

    :host(:not([visible])) {
      display: none;
    }

    .safe-area {
      position: absolute;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border: 0;
      container-type: size;
    }

    .label {
      display: block;
      max-width: 100%;
      max-height: 100%;
      overflow: hidden;
      color: var(--tangent-skin-label-color);
      font-size: min(
        var(--tangent-skin-font-size-cqw),
        var(--tangent-skin-font-size-cqh)
      );
      font-weight: 700;
      line-height: 1;
      letter-spacing: 0;
      white-space: nowrap;
      text-align: center;
    }

    :host([key-type="white"]) {
      --tangent-skin-label-color: #111111;
    }

    :host([key-type="black"]) {
      --tangent-skin-label-color: #ffffff;
    }

    :host([template="debug"]) .safe-area {
      outline: 1px solid #dc2626;
      outline-offset: -1px;
    }

    :host([template="debug"]) .label {
      outline: 1px solid #06b6d4;
      outline-offset: 2px;
    }
  `;

  @property({ type: String, attribute: "tangent-id" })
  public tangentId = "";

  @property({ type: String, reflect: true })
  public template: TangentSkinTemplate = "identifier";

  @property({ type: Boolean, reflect: true })
  public visible = true;

  @property({ type: String, attribute: "key-type", reflect: true })
  public keyType: "white" | "black" = "white";

  @property({ type: Boolean, attribute: "show-box" })
  public showBox = false;

  @property({ type: Number, attribute: "skin-margin-ratio" })
  public skinMarginRatio = TangentSkin.DEFAULT_MARGIN_RATIO;

  @property({ type: Number, attribute: "max-text-width-ratio" })
  public maxTextWidthRatio = TangentSkin.DEFAULT_MAX_TEXT_WIDTH_RATIO;

  public getResolvedMarginRatio(): number {
    return this.clamp(this.skinMarginRatio, 0, 0.45);
  }

  public getAvailableWidthRatio(): number {
    return Math.max(0, 1 - this.getResolvedMarginRatio() * 2);
  }

  public getCharacterCount(text: string = this.tangentId): number {
    return Math.max(1, Array.from(text).length);
  }

  public getMaxTextWidthRatio(): number {
    return this.clamp(this.maxTextWidthRatio, 0, 1);
  }

  public getFontSizeRatioOfAvailableWidth(text: string = this.tangentId): number {
    return this.getMaxTextWidthRatio() / this.getCharacterCount(text);
  }

  public getFontSizeRatioOfTangentWidth(text: string = this.tangentId): number {
    return this.getAvailableWidthRatio() * this.getFontSizeRatioOfAvailableWidth(text);
  }

  public getEstimatedTextWidthRatioOfAvailableWidth(text: string = this.tangentId): number {
    return this.getFontSizeRatioOfAvailableWidth(text) * this.getCharacterCount(text);
  }

  protected override render(): TemplateResult {
    if (!this.visible || this.template === "none") {
      return html``;
    }

    const marginRatio = this.getResolvedMarginRatio();
    const availableWidthRatio = this.getAvailableWidthRatio();
    const characterCount = this.getCharacterCount();
    const maxTextWidthRatio = this.getMaxTextWidthRatio();
    const fontSizeAvailableRatio = this.getFontSizeRatioOfAvailableWidth();
    const fontSizeTangentRatio = this.getFontSizeRatioOfTangentWidth();
    const estimatedTextWidthAvailableRatio =
      this.getEstimatedTextWidthRatioOfAvailableWidth();

    return html`
      <div
        class="safe-area"
        data-margin-ratio=${this.formatRatio(marginRatio)}
        data-available-width-ratio=${this.formatRatio(availableWidthRatio)}
        data-character-count=${String(characterCount)}
        data-max-text-width-ratio=${this.formatRatio(maxTextWidthRatio)}
        data-font-size-available-ratio=${this.formatRatio(fontSizeAvailableRatio)}
        data-font-size-tangent-ratio=${this.formatRatio(fontSizeTangentRatio)}
        data-estimated-text-width-available-ratio=${this.formatRatio(estimatedTextWidthAvailableRatio)}
        style=${styleMap({
          left: this.toPercent(marginRatio),
          top: this.toPercent(marginRatio),
          right: this.toPercent(marginRatio),
          bottom: this.toPercent(marginRatio)
        })}
      >
        ${this.renderIdentifier(fontSizeAvailableRatio)}
      </div>
    `;
  }

  private renderIdentifier(fontSizeAvailableRatio: number): TemplateResult {
    if (this.template !== "identifier" && this.template !== "debug") {
      return html``;
    }

    const fontSize = `${fontSizeAvailableRatio * 100}cqw`;

    return html`
      <span
        class="label"
        data-font-size-cqw=${fontSize}
        data-font-size-cqh=${fontSize}
        style=${styleMap({
          "--tangent-skin-font-size-cqw": fontSize,
          "--tangent-skin-font-size-cqh": fontSize,
          maxWidth: "100%",
          maxHeight: "100%"
        })}
      >${this.tangentId}</span>
    `;
  }

  private toPercent(value: number): string {
    return `${value * 100}%`;
  }

  private formatRatio(value: number): string {
    return value.toFixed(6);
  }

  private clamp(value: number, min: number, max: number): number {
    if (!Number.isFinite(value)) {
      return min;
    }

    return Math.max(min, Math.min(max, value));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "tangent-skin": TangentSkin;
  }
}