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
import {
  SequencerEventFactory,
  type ISequencerTrackProjection,
  SequencerUiGuard,
} from "./ui-contract.js";

type StepIndex = number;

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
  private stepStates: readonly boolean[] = [];

  public getProjection(): ISequencerTrackProjection {
    return Object.freeze({
      trackId: this.trackId,
      selected: this.selected,
      stepStates: [...this.stepStates],
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
    const normalizedStepCount = SequencerUiGuard.normalizePositiveInteger(
      this.stepCount,
      16,
    );

    if (this.stepStates.length === normalizedStepCount) {
      return;
    }

    this.stepStates = Array.from(
      { length: normalizedStepCount },
      (_, index) => this.stepStates[index] ?? false,
    );
  }

  public override render() {
    const displayDigit = SequencerUiGuard.toDisplayDigit(this.trackId);

    return html`
      <div class="track" role="group" aria-label="Sequencer track">
        <sequencer-digit-button
          class="track-toggle"
          .digit=${displayDigit}
          .selected=${this.selected}
          .width=${88}
          .height=${88}
          label-prefix="Track"
        ></sequencer-digit-button>
        ${repeat(
          this.stepStates,
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
      SequencerEventFactory.trackSelectionToggleRequested(
        this.trackId,
        !this.selected,
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

    const nextStates = this.toggleStep(this.stepStates, stepIndex);
    if (nextStates === this.stepStates) {
      return;
    }

    this.stepStates = nextStates;
    this.dispatchEvent(
      SequencerEventFactory.trackStepToggleRequested(
        this.trackId,
        stepIndex,
        this.stepStates[stepIndex] ?? false,
      ),
    );
  };

  private toggleStep(
    current: readonly boolean[],
    stepIndex: StepIndex,
  ): readonly boolean[] {
    if (stepIndex < 0 || stepIndex >= current.length) {
      return current;
    }

    return current.map((value, index) => (index === stepIndex ? !value : value));
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
}
