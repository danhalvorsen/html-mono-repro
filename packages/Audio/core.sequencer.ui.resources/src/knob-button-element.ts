import { LitElement, html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

import { OnCircularDraggingController } from "./Controllers/OnCircularDragging.js";
import {
  KnobButtonSvgFactory,
  type KnobRotationMode,
  type KnobVariant,
} from "./knobButton.js";
import {
  KnobButtonEvents,
  type IKnobButtonCircularDraggingDetail,
  type IKnobButtonToggleRequestedDetail,
} from "./events.js";
import { normalizeKnobVariant } from "./variant-normalization.js";

export class SequencerKnobButtonElement extends LitElement {
  public static readonly tagName = "sequencer-knob-button";

  public static override properties = {
    variant: { type: String, reflect: true },
    on: { type: Boolean, reflect: true },
    angle: { type: Number, reflect: true },
    mode: { type: String, reflect: true },
    steps: { type: Number, reflect: true },
    sectorMin: { type: Number, attribute: "sector-min", reflect: true },
    sectorMax: { type: Number, attribute: "sector-max", reflect: true },
    width: { type: Number, reflect: true },
    height: { type: Number, reflect: true },
  } as const;

  declare public variant: KnobVariant;
  declare public on: boolean;
  declare public angle: number;
  declare public mode: KnobRotationMode;
  declare public steps: number;
  declare public sectorMin: number;
  declare public sectorMax: number;
  declare public width: number;
  declare public height: number;

  private static readonly svgFactory = new KnobButtonSvgFactory();
  private readonly circularDragging = new OnCircularDraggingController(this, {
    minRadius: 8,
    onChange: (sample) => {
      this.angle = this.resolveNextAngle(
        this.angle + ((sample.deltaRadians * 180) / Math.PI),
      );
      this.dispatchCircularDraggingChanged(sample);
    },
    onEnd: (sample) => {
      this.dispatchCircularDraggingChanged(sample);
    },
  });

  public constructor() {
    super();
    this.variant = "matte";
    this.on = true;
    this.angle = 90;
    this.mode = "free";
    this.steps = 20;
    this.sectorMin = 180;
    this.sectorMax = 0;
    this.width = 88;
    this.height = 88;
  }

  public override render() {
    const variant = normalizeKnobVariant(this.variant);
    const resource = SequencerKnobButtonElement.svgFactory.create({
      id: `${SequencerKnobButtonElement.tagName}-${variant}`,
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
      on: this.on,
      variant,
      angle: this.normalizeAngular(this.angle),
    });

    return html`
      <button
        type="button"
        aria-pressed=${this.on ? "true" : "false"}
        aria-label="Knob ${variant}"
        style=${styleMap({
          display: "inline-block",
          inlineSize: `${this.width}px`,
          blockSize: `${this.height}px`,
          border: "0",
          background: "transparent",
          margin: "0",
          padding: "0",
          cursor: "pointer",
          userSelect: "none",
          WebkitTapHighlightColor: "transparent",
          touchAction: "none",
        })}
        @click=${this.handleClick}
      >
        <div style=${styleMap({ display: "block", inlineSize: "100%", blockSize: "100%" })}>${unsafeSVG(resource.svg)}</div>
      </button>
    `;
  }

  public get circularDraggingSample() {
    return this.circularDragging.sample;
  }

  private resolveNextAngle(value: number): number {
    if (this.mode === "stepped") {
      return this.snapAngleToSteps(value);
    }

    if (this.mode === "sector") {
      return this.clampAngleToSector(value);
    }

    return value;
  }

  private normalizeAngular(value: number): number {
    if (!Number.isFinite(value)) {
      return 0;
    }

    const normalized = value % 360;
    return normalized >= 0 ? normalized : normalized + 360;
  }

  private snapAngleToSteps(value: number): number {
    const stepCount = Number.isFinite(this.steps) && this.steps > 0
      ? Math.max(1, Math.round(this.steps))
      : 20;
    const stepSize = 360 / stepCount;

    return Math.round(value / stepSize) * stepSize;
  }

  private clampAngleToSector(value: number): number {
    const normalizedValue = this.normalizeAngular(value);
    const normalizedMin = this.normalizeAngular(this.sectorMin);
    const normalizedMax = this.normalizeAngular(this.sectorMax);

    if (this.isAngleWithinSector(normalizedValue, normalizedMin, normalizedMax)) {
      return value;
    }

    const distanceToMin = this.getCircularDistance(normalizedValue, normalizedMin);
    const distanceToMax = this.getCircularDistance(normalizedValue, normalizedMax);
    const target = distanceToMin <= distanceToMax ? normalizedMin : normalizedMax;
    const rotations = Math.round((value - normalizedValue) / 360);

    return target + (rotations * 360);
  }

  private isAngleWithinSector(
    value: number,
    min: number,
    max: number,
  ): boolean {
    if (min <= max) {
      return value >= min && value <= max;
    }

    return value >= min || value <= max;
  }

  private getCircularDistance(a: number, b: number): number {
    const rawDistance = Math.abs(a - b);
    return Math.min(rawDistance, 360 - rawDistance);
  }

  private readonly handleClick = (): void => {
    const variant = normalizeKnobVariant(this.variant);

    const detail: IKnobButtonToggleRequestedDetail = {
      variant,
      on: !this.on,
    };

    this.dispatchEvent(
      new CustomEvent<IKnobButtonToggleRequestedDetail>(
        KnobButtonEvents.toggleRequested,
        {
          detail,
          bubbles: true,
          composed: true,
        },
      ),
    );
  };

  private dispatchCircularDraggingChanged(
    sample: IKnobButtonCircularDraggingDetail["sample"],
  ): void {
    const detail: IKnobButtonCircularDraggingDetail = {
      variant: normalizeKnobVariant(this.variant),
      angle: this.angle,
      sample,
    };

    this.dispatchEvent(
      new CustomEvent<IKnobButtonCircularDraggingDetail>(
        KnobButtonEvents.circularDraggingChanged,
        {
          detail,
          bubbles: true,
          composed: true,
        },
      ),
    );
  }
}

if (!customElements.get(SequencerKnobButtonElement.tagName)) {
  customElements.define(
    SequencerKnobButtonElement.tagName,
    SequencerKnobButtonElement,
  );
}
