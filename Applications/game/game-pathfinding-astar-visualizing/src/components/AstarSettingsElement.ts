import { LitElement, css, html } from "lit";
import type {
  AstarHeuristic,
  AstarMovementMode,
  AstarSettings,
} from "../contracts/AstarVisualizerContracts.js";
import {
  AstarDomEventNames,
  createDefaultSettings,
} from "../contracts/AstarVisualizerContracts.js";
import { dispatchAstarEvent } from "../events/dispatchAstarEvent.js";

const HEURISTIC_OPTIONS: ReadonlyArray<AstarHeuristic> = [
  "manhattan",
  "euclidean",
  "octile",
  "chebyshev",
];

const MOVEMENT_MODE_OPTIONS: ReadonlyArray<AstarMovementMode> = [
  "four-way",
  "eight-way",
];

export class AstarSettingsElement extends LitElement {
  public static override readonly properties = {
    settings: { attribute: false },
    disabled: { type: Boolean },
  };

  public static override readonly styles = css`
    :host {
      display: block;
    }

    .settings {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      align-items: center;
      font-family: ui-sans-serif, system-ui, sans-serif;
    }

    label {
      display: inline-flex;
      gap: 0.25rem;
      align-items: center;
    }

    select,
    input {
      font: inherit;
    }
  `;

  public declare settings: AstarSettings;
  public declare disabled: boolean;

  public constructor() {
    super();
    this.settings = createDefaultSettings();
    this.disabled = false;
  }

  protected override render() {
    return html`
      <section class="settings" aria-label="A star settings">
        <label>
          Heuristic
          <select
            ?disabled=${this.disabled}
            .value=${this.settings.heuristic}
            @change=${this.handleHeuristicChange}
          >
            ${HEURISTIC_OPTIONS.map(
              (option) => html`<option value=${option}>${option}</option>`,
            )}
          </select>
        </label>

        <label>
          Movement
          <select
            ?disabled=${this.disabled}
            .value=${this.settings.movementMode}
            @change=${this.handleMovementModeChange}
          >
            ${MOVEMENT_MODE_OPTIONS.map(
              (option) => html`<option value=${option}>${option}</option>`,
            )}
          </select>
        </label>

        <label>
          Allow corner cutting
          <input
            type="checkbox"
            ?disabled=${this.disabled}
            .checked=${this.settings.allowCornerCutting}
            @change=${this.handleCornerCuttingChange}
          />
        </label>

        <label>
          Weight
          <input
            type="number"
            min="0.1"
            step="0.1"
            ?disabled=${this.disabled}
            .value=${String(this.settings.weight)}
            @change=${this.handleWeightChange}
          />
        </label>
      </section>
    `;
  }

  private handleHeuristicChange = (event: Event): void => {
    const value = this.getSelectValue(event);

    if (!this.isHeuristic(value)) {
      return;
    }

    this.emitSettingsChange({
      ...this.settings,
      heuristic: value,
    });
  };

  private handleMovementModeChange = (event: Event): void => {
    const value = this.getSelectValue(event);

    if (!this.isMovementMode(value)) {
      return;
    }

    this.emitSettingsChange({
      ...this.settings,
      movementMode: value,
    });
  };

  private handleCornerCuttingChange = (event: Event): void => {
    const target = event.target;

    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    this.emitSettingsChange({
      ...this.settings,
      allowCornerCutting: target.checked,
    });
  };

  private handleWeightChange = (event: Event): void => {
    const target = event.target;

    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    const weight = Number(target.value);

    this.emitSettingsChange({
      ...this.settings,
      weight,
    });
  };

  private emitSettingsChange(settings: AstarSettings): void {
    dispatchAstarEvent(this, AstarDomEventNames.SettingsChange, {
      settings,
    });
  }

  private getSelectValue(event: Event): string {
    const target = event.target;

    if (!(target instanceof HTMLSelectElement)) {
      return "";
    }

    return target.value;
  }

  private isHeuristic(value: string): value is AstarHeuristic {
    return HEURISTIC_OPTIONS.includes(value as AstarHeuristic);
  }

  private isMovementMode(value: string): value is AstarMovementMode {
    return MOVEMENT_MODE_OPTIONS.includes(value as AstarMovementMode);
  }
}

if (!customElements.get("astar-settings")) {
  customElements.define("astar-settings", AstarSettingsElement);
}

declare global {
  interface HTMLElementTagNameMap {
    "astar-settings": AstarSettingsElement;
  }
}
