import { LitElement, css, html } from "lit";
import type {
  AstarStatus,
  PlacementMode,
} from "../contracts/AstarVisualizerContracts.js";
import { AstarDomEventNames } from "../contracts/AstarVisualizerContracts.js";
import { dispatchAstarEvent } from "../events/dispatchAstarEvent.js";

export class AstarControlsElement extends LitElement {
  public static override readonly properties = {
    status: { type: String },
    millisecondsPerStep: {
      type: Number,
      attribute: "milliseconds-per-step",
    },
    placementMode: {
      type: String,
      attribute: "placement-mode",
    },
  };

  public static override readonly styles = css`
    :host {
      display: block;
    }

    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
      font-family: ui-sans-serif, system-ui, sans-serif;
    }

    button,
    select,
    input {
      font: inherit;
    }

    label {
      display: inline-flex;
      gap: 0.25rem;
      align-items: center;
    }
  `;

  public declare status: AstarStatus;
  public declare millisecondsPerStep: number;
  public declare placementMode: PlacementMode;

  public constructor() {
    super();
    this.status = "idle";
    this.millisecondsPerStep = 50;
    this.placementMode = "wall";
  }

  protected override render() {
    const isRunning = this.status === "running";

    return html`
      <section class="controls" aria-label="A star controls">
        <button type="button" ?disabled=${isRunning} @click=${this.emitStart}>
          Play
        </button>

        <button type="button" ?disabled=${!isRunning} @click=${this.emitPause}>
          Pause
        </button>

        <button type="button" ?disabled=${isRunning} @click=${this.emitStep}>
          Step
        </button>

        <button type="button" @click=${this.emitReset}>
          Reset
        </button>

        <label>
          Speed
          <input
            type="range"
            min="10"
            max="1000"
            step="10"
            .value=${String(this.millisecondsPerStep)}
            @input=${this.handleSpeedInput}
          />
        </label>

        <label>
          Placement
          <select .value=${this.placementMode} @change=${this.handleModeChange}>
            <option value="start">Start</option>
            <option value="goal">Goal</option>
            <option value="wall">Wall</option>
            <option value="erase">Erase</option>
          </select>
        </label>
      </section>
    `;
  }

  private emitStart = (): void => {
    dispatchAstarEvent(this, AstarDomEventNames.Start, {});
  };

  private emitPause = (): void => {
    dispatchAstarEvent(this, AstarDomEventNames.Pause, {});
  };

  private emitStep = (): void => {
    dispatchAstarEvent(this, AstarDomEventNames.Step, {});
  };

  private emitReset = (): void => {
    dispatchAstarEvent(this, AstarDomEventNames.Reset, {
      preserveWalls: true,
      preserveStartAndGoal: true,
    });
  };

  private handleSpeedInput = (event: Event): void => {
    const value = this.getNumberValue(event);

    if (value <= 0) {
      return;
    }

    dispatchAstarEvent(this, AstarDomEventNames.SpeedChange, {
      millisecondsPerStep: value,
    });
  };

  private handleModeChange = (event: Event): void => {
    const value = this.getStringValue(event);

    if (!this.isPlacementMode(value)) {
      return;
    }

    dispatchAstarEvent(this, AstarDomEventNames.PlacementModeChange, {
      mode: value,
    });
  };

  private getNumberValue(event: Event): number {
    const target = event.target;

    if (!(target instanceof HTMLInputElement)) {
      return Number.NaN;
    }

    return Number(target.value);
  }

  private getStringValue(event: Event): string {
    const target = event.target;

    if (!(target instanceof HTMLSelectElement)) {
      return "";
    }

    return target.value;
  }

  private isPlacementMode(value: string): value is PlacementMode {
    return (
      value === "start" ||
      value === "goal" ||
      value === "wall" ||
      value === "erase"
    );
  }
}

if (!customElements.get("astar-controls")) {
  customElements.define("astar-controls", AstarControlsElement);
}

declare global {
  interface HTMLElementTagNameMap {
    "astar-controls": AstarControlsElement;
  }
}
