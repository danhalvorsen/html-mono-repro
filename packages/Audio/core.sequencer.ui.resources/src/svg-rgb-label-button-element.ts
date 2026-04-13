import { LitElement, html, type TemplateResult } from "lit";
import { styleMap } from "lit/directives/style-map.js";

import "./rgb-button-element.js";
import "./tone-label-element.js";
import {
  createSvgRgbLabelButtonLayout,
  type SvgLabelAlignment,
  type SvgLabelAttachment,
  type SvgLabelPlacement,
} from "./svg-rgb-label-button-layout.js";

export class SvgRgbLabelButtonElement extends LitElement {
  public static readonly tagName = "svg-rgb-label-button";

  public static override properties = {
    r: { type: Number, reflect: true },
    g: { type: Number, reflect: true },
    b: { type: Number, reflect: true },
    on: { type: Boolean, reflect: true },
    label: { type: String, reflect: true },
    width: { type: Number, reflect: true },
    height: { type: Number, reflect: true },
    fillColor: { type: String, attribute: "fill-color", reflect: true },
    opacity: { type: Number, reflect: true },
    textColor: { type: String, attribute: "text-color", reflect: true },
    margin: { type: Number, reflect: true },
    labelPlacement: { type: String, attribute: "label-placement", reflect: true },
    labelAlignment: { type: String, attribute: "label-alignment", reflect: true },
    labelAttachment: { type: String, attribute: "label-attachment", reflect: true },
    labelGap: { type: Number, attribute: "label-gap", reflect: true },
    labelSpan: { type: Number, attribute: "label-span", reflect: true },
  } as const;

  declare public r: number;
  declare public g: number;
  declare public b: number;
  declare public on: boolean;
  declare public label: string;
  declare public width: number;
  declare public height: number;
  declare public fillColor: string;
  declare public opacity: number;
  declare public textColor: string;
  declare public margin: number;
  declare public labelPlacement: SvgLabelPlacement;
  declare public labelAlignment: SvgLabelAlignment;
  declare public labelAttachment: SvgLabelAttachment;
  declare public labelGap: number;
  declare public labelSpan: number;

  public constructor() {
    super();
    this.r = 255;
    this.g = 0;
    this.b = 0;
    this.on = true;
    this.label = "C";
    this.width = 88;
    this.height = 88;
    this.fillColor = "";
    this.opacity = 1;
    this.textColor = "";
    this.margin = 8;
    this.labelPlacement = "bottom";
    this.labelAlignment = "center";
    this.labelAttachment = "inside";
    this.labelGap = 0;
    this.labelSpan = 1;
  }

  public override render(): TemplateResult {
    const layout = createSvgRgbLabelButtonLayout({
      width: this.width,
      height: this.height,
      labelMargin: this.margin,
      labelPlacement: this.labelPlacement,
      labelAlignment: this.labelAlignment,
      labelAttachment: this.labelAttachment,
      labelGap: this.labelGap,
      labelSpan: this.labelSpan,
    });

    return html`
      <div
        style=${styleMap({
          position: "relative",
          display: "block",
          inlineSize: `${layout.boundsFrame.width}px`,
          blockSize: `${layout.boundsFrame.height}px`,
        })}
      >
        <div
          style=${styleMap({
            position: "absolute",
            insetInlineStart: `${layout.buttonFrame.x - layout.boundsFrame.x}px`,
            insetBlockStart: `${layout.buttonFrame.y - layout.boundsFrame.y}px`,
          })}
        >
          <sequencer-rgb-button
            .r=${this.r}
            .g=${this.g}
            .b=${this.b}
            .on=${this.on}
            .width=${layout.buttonFrame.width}
            .height=${layout.buttonFrame.height}
          ></sequencer-rgb-button>
        </div>

        <div
          style=${styleMap({
            position: "absolute",
            insetInlineStart: `${layout.labelFrame.x - layout.boundsFrame.x}px`,
            insetBlockStart: `${layout.labelFrame.y - layout.boundsFrame.y}px`,
          })}
        >
          <svg-label
            .label=${this.label}
            .buttonWidth=${layout.labelFrame.width}
            .buttonHeight=${layout.labelFrame.height}
            .fillColor=${this.fillColor}
            .fillOpacity=${this.opacity}
            .textColor=${this.textColor}
          ></svg-label>
        </div>
      </div>
    `;
  }
}

if (!customElements.get(SvgRgbLabelButtonElement.tagName)) {
  customElements.define(
    SvgRgbLabelButtonElement.tagName,
    SvgRgbLabelButtonElement,
  );
}
