import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import "@monorepo/core.sequencer.ui.resources";
import {
  DigitButtonEvents,
  RgbButtonEvents,
  type IDigitButtonPressedDetail,
  type IRgbButtonToggleRequestedDetail,
} from "@monorepo/core.sequencer.ui.resources";

type StepIndex = number;

const sequencerTrackPatternSelectionToggleRequestedEventName =
  "sequencer-track-pattern-selection-toggle-requested";

export const SequencerTrackEvents = Object.freeze({
  patternSelectionToggleRequested:
    sequencerTrackPatternSelectionToggleRequestedEventName,
} as const);

export interface ISequencerTrackPatternSelectionToggleRequestedDetail {
  readonly trackId: number;
}

export interface ISequencerTrackProjection {
  readonly trackId: number;
  readonly selected: boolean;
  readonly stepStates: readonly boolean[];
}

@customElement("sequencer-track")
export class SequencerTrack extends LitElement {
  public static override styles = css`
    :host {
      display: block;
    }

    .track {
      display: flex;
      flex-wrap: nowrap;
      gap: 8px;
      align-items: center;
    }

    .track-toggle {
      flex: 0 0 auto;
    }
  `;

  @property({ type: Number })
  public trackId = 0;

  @property({ type: Number })
  public stepCount = 16;

  @property({ type: Boolean, reflect: true })
  public selected = true;

  @state()
  private _stepStates: readonly boolean[] = [];

  public getProjection(): ISequencerTrackProjection {
    return Object.freeze({
      trackId: this.trackId,
      selected: this.selected,
      stepStates: [...this._stepStates],
    });
  }

  public override disconnectedCallback(): void {
    this.renderRoot.removeEventListener(
      RgbButtonEvents.toggleRequested,
      this.handleToggleRequested as EventListener,
    );
    this.renderRoot.removeEventListener(
      DigitButtonEvents.pressed,
      this.handleSelectionToggleRequested as EventListener,
    );
    super.disconnectedCallback();
  }

  protected override firstUpdated(): void {
    this.renderRoot.addEventListener(
      RgbButtonEvents.toggleRequested,
      this.handleToggleRequested as EventListener,
    );
    this.renderRoot.addEventListener(
      DigitButtonEvents.pressed,
      this.handleSelectionToggleRequested as EventListener,
    );
  }

  protected override willUpdate(): void {
    const normalizedStepCount = SequencerTrack.normalizeStepCount(this.stepCount);

    if (this._stepStates.length === normalizedStepCount) {
      return;
    }

    this._stepStates = Array.from(
      { length: normalizedStepCount },
      (_, index) => this._stepStates[index] ?? false,
    );
  }

  public override render() {
    const displayDigit = SequencerTrack.toDisplayDigit(this.trackId);

    return html`
      <div
        class="track"
        role="group"
        aria-label="Sequencer track"
      >
        <sequencer-digit-button
          class="track-toggle"
          .digit=${displayDigit}
          .selected=${this.selected}
          .width=${88}
          .height=${88}
          label-prefix="Track"
        ></sequencer-digit-button>
        ${repeat(
          this._stepStates,
          (_, index) => index,
          (isActive, index) => html`
            <sequencer-rgb-button
              data-step-index=${String(index)}
              .on=${isActive}
            ></sequencer-rgb-button>
          `,
        )}
      </div>
    `;
  }

  private readonly handleSelectionToggleRequested = (
    event: CustomEvent<IDigitButtonPressedDetail>,
  ): void => {
    const buttonElement = event.target;

    if (!(buttonElement instanceof HTMLElement)) {
      return;
    }

    if (buttonElement.tagName.toLowerCase() !== "sequencer-digit-button") {
      return;
    }

    this.dispatchEvent(
      new CustomEvent<ISequencerTrackPatternSelectionToggleRequestedDetail>(
        SequencerTrackEvents.patternSelectionToggleRequested,
        {
          detail: {
            trackId: this.trackId,
          },
          bubbles: true,
          composed: true,
        },
      ),
    );
  };

  private readonly handleToggleRequested = (
    event: CustomEvent<IRgbButtonToggleRequestedDetail>,
  ): void => {
    const buttonElement = event.target;

    if (!(buttonElement instanceof HTMLElement)) {
      return;
    }

    const stepIndex = SequencerTrack.tryParseStepIndex(
      buttonElement.dataset.stepIndex,
    );

    if (stepIndex === undefined) {
      return;
    }

    this._stepStates = this.toggleStep(this._stepStates, stepIndex);
  };

  private toggleStep(
    current: readonly boolean[],
    stepIndex: StepIndex,
  ): readonly boolean[] {
    if (stepIndex < 0 || stepIndex >= current.length) {
      return current;
    }

    return current.map((value, index) =>
      index === stepIndex ? !value : value,
    );
  }

  private static tryParseStepIndex(value: string | undefined): StepIndex | undefined {
    if (value === undefined) {
      return undefined;
    }

    const parsed = Number.parseInt(value, 10);

    if (!Number.isFinite(parsed) || parsed < 0) {
      return undefined;
    }

    return parsed;
  }

  private static normalizeStepCount(value: number): number {
    if (!Number.isFinite(value)) {
      return 16;
    }

    const normalized = Math.floor(value);
    return normalized > 0 ? normalized : 16;
  }

  private static toDisplayDigit(trackId: number): number {
    if (!Number.isFinite(trackId)) {
      return 1;
    }

    const normalized = Math.max(0, Math.floor(trackId));
    return (normalized % 8) + 1;
  }
}
