import "@monorepo/core.sequencer.ui.resources";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import type { TemplateResult } from "lit";
import {
  ShiftButtonEvents,
  TransportButtonEvents,
  type ITransportButtonPressedDetail,
} from "@monorepo/core.sequencer.ui.resources";

type SequencerTransportVariant = "play" | "stop";
type SequencerControlButtonId = SequencerTransportVariant;
type SequencerControlButtonTag = "play-button" | "stop-button";
type SequencerControlBpm = 100 | 130 | 160;
type SequencerControlFeatureId = "column-indicator";

const sequencerControlTransportRequestedEventName =
  "sequencer-control-transport-requested";
const sequencerControlBpmRequestedEventName = "sequencer-control-bpm-requested";
const sequencerControlColumnIndicatorToggleRequestedEventName =
  "sequencer-control-column-indicator-toggle-requested";

export const SequencerControlEvents = Object.freeze({
  transportRequested: sequencerControlTransportRequestedEventName,
  bpmRequested: sequencerControlBpmRequestedEventName,
  columnIndicatorToggleRequested:
    sequencerControlColumnIndicatorToggleRequestedEventName,
} as const);

export interface ISequencerControlTransportRequestedDetail {
  readonly id: "play" | "stop";
  readonly address: readonly [column: number, row: number];
}

export interface ISequencerControlBpmRequestedDetail {
  readonly bpm: SequencerControlBpm;
  readonly address: readonly [column: number, row: number];
}

export interface ISequencerControlColumnIndicatorToggleRequestedDetail {
  readonly enabled: boolean;
  readonly address: readonly [column: number, row: number];
}

const sequencerControlConstants = Object.freeze({
  ariaLabel: "Sequencer transport controls",
  defaultButtonWidth: 88,
  defaultButtonHeight: 56,
  defaultGap: 8,
});

const buttonTagById: Readonly<Record<SequencerControlButtonId, SequencerControlButtonTag>> = Object.freeze({
  play: "play-button",
  stop: "stop-button",
});

class SequencerControlAddress {
  public readonly column: number;
  public readonly row: number;

  public constructor(column: number, row: number) {
    SequencerControlAddress.ensureNonNegativeInteger(column, "column");
    SequencerControlAddress.ensureNonNegativeInteger(row, "row");
    this.column = column;
    this.row = row;
  }

  public toAttributeValue(): string {
    return `[${this.column},${this.row}]`;
  }

  public toIdSuffix(): string {
    return `${this.column}-${this.row}`;
  }

  public toTuple(): readonly [column: number, row: number] {
    return [this.column, this.row] as const;
  }

  private static ensureNonNegativeInteger(value: number, name: string): void {
    if (!Number.isInteger(value) || value < 0) {
      throw new Error(`SequencerControlAddress ${name} must be a non-negative integer.`);
    }
  }
}

class SequencerControlButtonDefinition {
  public readonly id: SequencerControlButtonId;
  public readonly address: SequencerControlAddress;
  private readonly tagName: SequencerControlButtonTag;

  public constructor(id: SequencerControlButtonId, address: SequencerControlAddress) {
    this.id = id;
    this.address = address;
    this.tagName = buttonTagById[id];
  }

  public toDomId(): string {
    return `${this.id}-${this.address.toIdSuffix()}`;
  }

  public toSpecAttributeValue(): string {
    return JSON.stringify([this.id, this.address.column, this.address.row]);
  }

  public toTransportRequestDetail(): ISequencerControlTransportRequestedDetail {
    return Object.freeze({
      id: this.id,
      address: this.address.toTuple(),
    });
  }

  public render(width: number, height: number, isActive: boolean): TemplateResult {
    const id = this.toDomId();
    const address = this.address.toAttributeValue();
    const specification = this.toSpecAttributeValue();
    const active = String(isActive);
    const ariaPressed = isActive ? "true" : "false";

    if (this.tagName === "play-button") {
      return html`
        <play-button
          id=${id}
          data-id=${this.id}
          address=${address}
          data-button-spec=${specification}
          data-active=${active}
          aria-pressed=${ariaPressed}
          .width=${width}
          .height=${height}
        ></play-button>
      `;
    }

    return html`
      <stop-button
        id=${id}
        data-id=${this.id}
        address=${address}
        data-button-spec=${specification}
        data-active=${active}
        aria-pressed=${ariaPressed}
        .width=${width}
        .height=${height}
      ></stop-button>
    `;
  }
}

class SequencerControlBpmDefinition {
  public readonly bpm: SequencerControlBpm;
  public readonly address: SequencerControlAddress;

  public constructor(bpm: SequencerControlBpm, address: SequencerControlAddress) {
    this.bpm = bpm;
    this.address = address;
  }

  public toDomId(): string {
    return `bpm-${this.bpm}-${this.address.toIdSuffix()}`;
  }

  public render(width: number, height: number, isActive: boolean): TemplateResult {
    return html`
      <sequencer-shift-button
        id=${this.toDomId()}
        class="bpm-button"
        data-bpm=${String(this.bpm)}
        data-address=${this.address.toAttributeValue()}
        data-active=${String(isActive)}
        .on=${isActive}
        .label=${String(this.bpm)}
        .width=${width}
        .height=${height}
      ></sequencer-shift-button>
    `;
  }
}

class SequencerControlFeatureDefinition {
  public readonly id: SequencerControlFeatureId;
  public readonly label: string;
  public readonly address: SequencerControlAddress;

  public constructor(
    id: SequencerControlFeatureId,
    label: string,
    address: SequencerControlAddress,
  ) {
    this.id = id;
    this.label = label;
    this.address = address;
  }

  public toDomId(): string {
    return `${this.id}-${this.address.toIdSuffix()}`;
  }

  public render(width: number, height: number, isActive: boolean): TemplateResult {
    return html`
      <button
        id=${this.toDomId()}
        type="button"
        class="feature-button"
        data-feature-id=${this.id}
        data-address=${this.address.toAttributeValue()}
        data-active=${String(isActive)}
        aria-pressed=${isActive ? "true" : "false"}
        style="width:${width}px;height:${height}px;"
      >
        ${this.label}
      </button>
    `;
  }
}

@customElement("stop-button")
export class StopButtonElement extends LitElement {
  public static override styles = css`
    :host {
      display: block;
      inline-size: 100%;
      block-size: 100%;
    }
  `;

  @property({ type: Number, reflect: true })
  public width = sequencerControlConstants.defaultButtonWidth;

  @property({ type: Number, reflect: true })
  public height = sequencerControlConstants.defaultButtonHeight;

  @property({ type: String, reflect: true })
  public label = "";

  public override render() {
    return html`
      <play-button
        variant="stop"
        .width=${this.width}
        .height=${this.height}
        .label=${this.label}
      ></play-button>
    `;
  }
}

@customElement("sequencer-control")
export class SequencerControl extends LitElement {
  public static override styles = css`
    :host {
      display: block;
    }

    .control-grid {
      display: grid;
      grid-auto-flow: row;
    }

    .bpm-row,
    .transport-row {
      display: grid;
      grid-auto-flow: column;
      justify-content: start;
      align-items: center;
    }

    .transport-row > play-button,
    .transport-row > stop-button {
      opacity: 0.55;
      filter: saturate(0.7) brightness(0.9);
      transition: opacity 120ms ease, filter 120ms ease, transform 120ms ease;
    }

    .transport-row > play-button[data-active="true"],
    .transport-row > stop-button[data-active="true"] {
      opacity: 1;
      filter: saturate(1.2) brightness(1.08);
      transform: translateY(-1px);
    }

    .bpm-row > sequencer-shift-button {
      opacity: 0.6;
      filter: saturate(0.78) brightness(0.92);
      transition: opacity 120ms ease, filter 120ms ease, transform 120ms ease;
    }

    .bpm-row > sequencer-shift-button[data-active="true"] {
      opacity: 1;
      filter: saturate(1.08) brightness(1.02);
      transform: translateY(-1px);
    }

    .transport-row > .feature-button {
      border: 1px solid #4e4e4e;
      border-radius: 6px;
      background: #171717;
      color: #f3f3f3;
      font: 600 0.76rem/1.1 "Segoe UI", sans-serif;
      letter-spacing: 0.03em;
      opacity: 0.65;
      cursor: pointer;
      transition: opacity 120ms ease, filter 120ms ease, transform 120ms ease,
        border-color 120ms ease;
    }

    .transport-row > .feature-button[data-active="true"] {
      opacity: 1;
      border-color: #19d8ff;
      filter: brightness(1.1);
      transform: translateY(-1px);
    }
  `;

  private static readonly buttons: readonly SequencerControlButtonDefinition[] = Object.freeze([
    new SequencerControlButtonDefinition("play", new SequencerControlAddress(0, 4)),
    new SequencerControlButtonDefinition("stop", new SequencerControlAddress(1, 4)),
  ]);
  private static readonly bpmButtons: readonly SequencerControlBpmDefinition[] = Object.freeze([
    new SequencerControlBpmDefinition(100, new SequencerControlAddress(2, 4)),
    new SequencerControlBpmDefinition(130, new SequencerControlAddress(3, 4)),
    new SequencerControlBpmDefinition(160, new SequencerControlAddress(4, 4)),
  ]);
  private static readonly featureButtons: readonly SequencerControlFeatureDefinition[] =
    Object.freeze([
      new SequencerControlFeatureDefinition(
        "column-indicator",
        "Indicator",
        new SequencerControlAddress(5, 4),
      ),
    ]);
  private static readonly buttonById: Readonly<
    Map<SequencerControlButtonId, SequencerControlButtonDefinition>
  > = new Map(
    SequencerControl.buttons.map((button) => [button.id, button] as const),
  );
  private static readonly bpmButtonByValue: Readonly<
    Map<SequencerControlBpm, SequencerControlBpmDefinition>
  > = new Map(
    SequencerControl.bpmButtons.map((button) => [button.bpm, button] as const),
  );
  private static readonly featureButtonById: Readonly<
    Map<SequencerControlFeatureId, SequencerControlFeatureDefinition>
  > = new Map(
    SequencerControl.featureButtons.map((button) => [button.id, button] as const),
  );

  @property({ type: Number, attribute: "button-width" })
  public buttonWidth = sequencerControlConstants.defaultButtonWidth;

  @property({ type: Number, attribute: "button-height" })
  public buttonHeight = sequencerControlConstants.defaultButtonHeight;

  @property({ type: Number })
  public gap = sequencerControlConstants.defaultGap;

  @property({ type: Boolean, reflect: true })
  public playing = false;

  @property({ type: Number, reflect: true })
  public bpm: SequencerControlBpm = 130;

  @property({ type: Boolean, attribute: "column-indicator-enabled", reflect: true })
  public columnIndicatorEnabled = false;

  public override disconnectedCallback(): void {
    this.renderRoot.removeEventListener(
      TransportButtonEvents.pressed,
      this.handleTransportPressed as EventListener,
    );
    this.renderRoot.removeEventListener(
      ShiftButtonEvents.pressed,
      this.handleBpmPressed as EventListener,
    );
    this.renderRoot.removeEventListener(
      "click",
      this.handleFeatureToggleRequested as EventListener,
    );
    super.disconnectedCallback();
  }

  protected override firstUpdated(): void {
    this.renderRoot.addEventListener(
      TransportButtonEvents.pressed,
      this.handleTransportPressed as EventListener,
    );
    this.renderRoot.addEventListener(
      ShiftButtonEvents.pressed,
      this.handleBpmPressed as EventListener,
    );
    this.renderRoot.addEventListener(
      "click",
      this.handleFeatureToggleRequested as EventListener,
    );
  }

  public override render() {
    const width = SequencerControl.normalizePositive(this.buttonWidth, sequencerControlConstants.defaultButtonWidth);
    const height = SequencerControl.normalizePositive(this.buttonHeight, sequencerControlConstants.defaultButtonHeight);
    const gap = SequencerControl.normalizePositive(this.gap, sequencerControlConstants.defaultGap);

    return html`
      <div
        class="control-grid"
        role="group"
        aria-label=${sequencerControlConstants.ariaLabel}
        style="row-gap: ${gap}px;"
      >
        <div
          class="bpm-row"
          style="
            grid-template-columns: repeat(${SequencerControl.bpmButtons.length}, ${width}px);
            column-gap: ${gap}px;
          "
        >
          ${repeat(
            SequencerControl.bpmButtons,
            (button) => button.toDomId(),
            (button) =>
              button.render(width, height, SequencerControl.isBpmActive(button.bpm, this.bpm)),
          )}
        </div>
        <div
          class="transport-row"
          style="
            grid-template-columns: repeat(${SequencerControl.buttons.length + SequencerControl.featureButtons.length}, ${width}px);
            column-gap: ${gap}px;
          "
        >
          ${repeat(
            SequencerControl.buttons,
            (button) => button.toDomId(),
            (button) =>
              button.render(
                width,
                height,
                SequencerControl.isButtonActive(button.id, this.playing),
              ),
          )}
          ${repeat(
            SequencerControl.featureButtons,
            (button) => button.toDomId(),
            (button) =>
              button.render(
                width,
                height,
                SequencerControl.isFeatureActive(
                  button.id,
                  this.columnIndicatorEnabled,
                ),
              ),
          )}
        </div>
      </div>
    `;
  }

  private readonly handleTransportPressed = (
    event: CustomEvent<ITransportButtonPressedDetail>,
  ): void => {
    event.stopPropagation();

    if (!SequencerControl.isButtonId(event.detail.variant)) {
      return;
    }

    const button = SequencerControl.buttonById.get(event.detail.variant);
    if (!button) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent<ISequencerControlTransportRequestedDetail>(
        SequencerControlEvents.transportRequested,
        {
          detail: button.toTransportRequestDetail(),
          bubbles: true,
          composed: true,
        },
      ),
    );
  };

  private readonly handleBpmPressed = (event: Event): void => {
    const eventTarget = event.target;

    if (!(eventTarget instanceof HTMLElement)) {
      return;
    }

    const buttonElement = eventTarget.closest("sequencer-shift-button[data-bpm]");
    if (!(buttonElement instanceof HTMLElement)) {
      return;
    }

    const bpm = SequencerControl.tryParseBpm(buttonElement.dataset.bpm);
    if (bpm === undefined) {
      return;
    }

    const buttonDefinition = SequencerControl.bpmButtonByValue.get(bpm);
    if (!buttonDefinition) {
      return;
    }

    this.bpm = bpm;

    this.dispatchEvent(
      new CustomEvent<ISequencerControlBpmRequestedDetail>(
        SequencerControlEvents.bpmRequested,
        {
          detail: {
            bpm,
            address: buttonDefinition.address.toTuple(),
          },
          bubbles: true,
          composed: true,
        },
      ),
    );
  };

  private readonly handleFeatureToggleRequested = (event: Event): void => {
    const eventTarget = event.target;
    if (!(eventTarget instanceof HTMLElement)) {
      return;
    }

    const buttonElement = eventTarget.closest("button[data-feature-id]");
    if (!(buttonElement instanceof HTMLButtonElement)) {
      return;
    }

    const featureId = SequencerControl.tryParseFeatureId(
      buttonElement.dataset.featureId,
    );
    if (featureId === undefined) {
      return;
    }

    const buttonDefinition = SequencerControl.featureButtonById.get(featureId);
    if (!buttonDefinition) {
      return;
    }

    if (featureId === "column-indicator") {
      this.columnIndicatorEnabled = !this.columnIndicatorEnabled;

      this.dispatchEvent(
        new CustomEvent<ISequencerControlColumnIndicatorToggleRequestedDetail>(
          SequencerControlEvents.columnIndicatorToggleRequested,
          {
            detail: {
              enabled: this.columnIndicatorEnabled,
              address: buttonDefinition.address.toTuple(),
            },
            bubbles: true,
            composed: true,
          },
        ),
      );
    }
  };

  private static isButtonId(value: string): value is SequencerControlButtonId {
    return value === "play" || value === "stop";
  }

  private static isButtonActive(
    id: SequencerControlButtonId,
    playing: boolean,
  ): boolean {
    if (id === "play") {
      return playing;
    }

    return !playing;
  }

  private static isBpmActive(
    bpm: SequencerControlBpm,
    selectedBpm: SequencerControlBpm,
  ): boolean {
    return bpm === selectedBpm;
  }

  private static isFeatureActive(
    featureId: SequencerControlFeatureId,
    columnIndicatorEnabled: boolean,
  ): boolean {
    if (featureId === "column-indicator") {
      return columnIndicatorEnabled;
    }

    return false;
  }

  private static tryParseBpm(
    value: string | undefined,
  ): SequencerControlBpm | undefined {
    if (value === "100") return 100;
    if (value === "130") return 130;
    if (value === "160") return 160;
    return undefined;
  }

  private static tryParseFeatureId(
    value: string | undefined,
  ): SequencerControlFeatureId | undefined {
    if (value === "column-indicator") return "column-indicator";
    return undefined;
  }

  private static normalizePositive(value: number, fallback: number): number {
    if (!Number.isFinite(value)) return fallback;
    const normalized = Math.floor(value);
    return normalized > 0 ? normalized : fallback;
  }
}
