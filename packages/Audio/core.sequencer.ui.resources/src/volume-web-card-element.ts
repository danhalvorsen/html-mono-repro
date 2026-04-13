import { LitElement, html } from "lit";

import { type IKnobButtonCircularDraggingDetail } from "./events.js";
import type { KnobRotationMode, KnobVariant } from "./knobButton.js";
import "./knob-button-element.js";
import "./tone-label-element.js";
import "./web-card-element.js";

const volumeHeaderLabel = "VOLUME";

export class VolumeWebCardElement extends LitElement {
  public static readonly tagName = "volume-web-card";

  public static override properties = {
    angle: { type: Number, reflect: true },
    variant: { type: String, reflect: true },
    on: { type: Boolean, reflect: true },
    mode: { type: String, reflect: true },
    steps: { type: Number, reflect: true },
    sectorMin: { type: Number, attribute: "sector-min", reflect: true },
    sectorMax: { type: Number, attribute: "sector-max", reflect: true },
    knobWidth: { type: Number, attribute: "knob-width", reflect: true },
    knobHeight: { type: Number, attribute: "knob-height", reflect: true },
    labelWidth: { type: Number, attribute: "label-width", reflect: true },
    labelHeight: { type: Number, attribute: "label-height", reflect: true },
  } as const;

  declare public angle: number;
  declare public variant: KnobVariant;
  declare public on: boolean;
  declare public mode: KnobRotationMode;
  declare public steps: number;
  declare public sectorMin: number;
  declare public sectorMax: number;
  declare public knobWidth: number;
  declare public knobHeight: number;
  declare public labelWidth: number;
  declare public labelHeight: number;

  public constructor() {
    super();
    this.angle = 90;
    this.variant = "matte";
    this.on = true;
    this.mode = "free";
    this.steps = 20;
    this.sectorMin = 180;
    this.sectorMax = 0;
    this.knobWidth = 88;
    this.knobHeight = 88;
    this.labelWidth = 120;
    this.labelHeight = 24;
  }

  public override render() {
    return html`
      <web-card
        .headerLabel=${volumeHeaderLabel}
        .mainLabel=${""}
        .footerLabel=${this.formatAngleLabel()}
        .labelWidth=${this.labelWidth}
        .labelHeight=${this.labelHeight}
      >
        <div slot="main">
          <sequencer-knob-button
            .variant=${this.variant}
            .on=${this.on}
            .angle=${this.angle}
            .mode=${this.mode}
            .steps=${this.steps}
            .sectorMin=${this.sectorMin}
            .sectorMax=${this.sectorMax}
            .width=${this.knobWidth}
            .height=${this.knobHeight}
            @knob-circular-drag=${this.handleKnobCircularDragging}
          ></sequencer-knob-button>
        </div>
      </web-card>
    `;
  }

  private formatAngleLabel(): string {
    return `${Math.round(this.normalizeAngle(this.angle))}\u00b0`;
  }

  private normalizeAngle(value: number): number {
    if (!Number.isFinite(value)) {
      return 0;
    }

    const normalized = value % 360;
    return normalized >= 0 ? normalized : normalized + 360;
  }

  private readonly handleKnobCircularDragging = (
    event: CustomEvent<IKnobButtonCircularDraggingDetail>,
  ): void => {
    this.angle = event.detail.angle;
  };
}

if (!customElements.get(VolumeWebCardElement.tagName)) {
  customElements.define(VolumeWebCardElement.tagName, VolumeWebCardElement);
}
