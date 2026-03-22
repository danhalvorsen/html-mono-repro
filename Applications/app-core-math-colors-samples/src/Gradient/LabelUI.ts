import { LitElement, svg } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("mr-label-badge")
export class LabelBadge extends LitElement {
  @property({ type: String })
  public text = "text";

  @property({ type: Number })
  public width = 120;

  @property({ type: Number })
  public height = 32;

  @property({ type: Number, attribute: "corner-radius" })
  public cornerRadius = 8;

  @property({ type: String })
  public fill = "#f3f4f6";

  @property({ type: String })
  public stroke = "#9ca3af";

  @property({ type: Number, attribute: "stroke-width" })
  public strokeWidth = 1;

  @property({ type: String, attribute: "text-color" })
  public textColor = "#111827";

  @property({ type: Number, attribute: "font-size" })
  public fontSize = 14;

  @property({ type: Number, attribute: "padding-x" })
  public paddingX = 12;

  protected override createRenderRoot(): this {
    return this;
  }

  protected override render() {
    const width = Math.max(1, this.width);
    const height = Math.max(1, this.height);
    const radius = Math.max(0, Math.min(this.cornerRadius, Math.min(width, height) / 2));
    const textX = this.paddingX;
    const textY = height / 2;

    return svg`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="${width}"
        height="${height}"
        viewBox="0 0 ${width} ${height}"
        role="img"
        aria-label="${this.text}"
      >
        <rect
          x="0.5"
          y="0.5"
          width="${width - 1}"
          height="${height - 1}"
          rx="${radius}"
          ry="${radius}"
          fill="${this.fill}"
          stroke="${this.stroke}"
          stroke-width="${this.strokeWidth}"
        ></rect>

        <text
          x="${textX}"
          y="${textY}"
          fill="${this.textColor}"
          font-size="${this.fontSize}"
          font-family="Arial, Helvetica, sans-serif"
          dominant-baseline="middle"
          text-anchor="start"
        >
          ${this.text}
        </text>
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "mr-label-badge": LabelBadge;
  }
}
