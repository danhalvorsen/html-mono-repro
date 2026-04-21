import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import "./sequencerTrack.js";
import type { ISequencerTrackProjection, SequencerTrack } from "./sequencerTrack.js";

export interface ISequencerGridTrackProjection {
  readonly trackId: number;
  readonly selected: boolean;
  readonly stepStates: readonly boolean[];
}

export interface ISequencerGridTrackSelectionState {
  readonly trackId: number;
  readonly selected: boolean;
}

export interface ISequencerGridColumnIndicatorProjection {
  readonly enabled: boolean;
  readonly playing: boolean;
  readonly currentColumn: number;
}

@customElement("sequencer-grid")
export class SequencerGrid extends LitElement {
  public static override styles = css`
    :host {
      display: block;
    }

    ul {
      margin: 0;
      padding: 0;
      list-style: none;
      display: grid;
      gap: 10px;
    }

    .column-indicator-row {
      display: grid;
      margin-block-end: 10px;
    }

    .column-indicator-button {
      border: 1px solid rgba(25, 216, 255, 0.45);
      border-radius: 7px;
      background: rgba(25, 216, 255, 0.18);
      opacity: 0.58;
      transition: opacity 120ms ease, filter 120ms ease, transform 120ms ease;
      pointer-events: none;
    }

    .column-indicator-button[data-active="true"] {
      opacity: 1;
      background: rgba(25, 216, 255, 0.95);
      filter: brightness(1.1);
      transform: translateY(-1px);
    }
  `;

  private static readonly trackButtonHeight = 88;
  private static readonly trackButtonGap = 8;

  @property({ type: Number })
  public trackCount = 2;

  @property({ type: Number })
  public stepCount = 16;

  @property({ attribute: false })
  public trackSelectionById: Readonly<Record<number, boolean>> = Object.freeze(
    {},
  );

  @property({ type: Boolean, attribute: "column-indicator-enabled" })
  public columnIndicatorEnabled = false;

  @property({ type: Boolean, attribute: false })
  public columnIndicatorPlaying = false;

  @property({ type: Number, attribute: false })
  public currentColumn = -1;

  public setTrackSelectionStates(
    states: readonly ISequencerGridTrackSelectionState[],
  ): void {
    const nextState: Record<number, boolean> = {};

    for (const state of states) {
      nextState[state.trackId] = state.selected;
    }

    this.trackSelectionById = Object.freeze(nextState);
  }

  public setColumnIndicatorProjection(
    projection: ISequencerGridColumnIndicatorProjection,
  ): void {
    this.columnIndicatorEnabled = projection.enabled;
    this.columnIndicatorPlaying = projection.playing;
    this.currentColumn = projection.currentColumn;
  }

  public getTrackProjections(): readonly ISequencerGridTrackProjection[] {
    const trackElements = Array.from(
      this.renderRoot.querySelectorAll("sequencer-track"),
    ) as readonly SequencerTrack[];

    if (trackElements.length === 0) {
      const trackCount = SequencerGrid.normalizePositive(this.trackCount, 2);
      const stepCount = SequencerGrid.normalizePositive(this.stepCount, 16);

      return Array.from({ length: trackCount }, (_, trackIndex) =>
        SequencerGrid.createDefaultTrackProjection(
          trackIndex,
          stepCount,
          this.trackSelectionById[trackIndex] ?? true,
        ),
      );
    }

    return trackElements.map((track) => track.getProjection());
  }

  public override render() {
    const tracks = SequencerGrid.normalizePositive(this.trackCount, 2);
    const steps = SequencerGrid.normalizePositive(this.stepCount, 16);
    const indexes = Array.from({ length: tracks }, (_, i) => i);
    const columns = Array.from({ length: steps }, (_, i) => i);
    const indicatorHeight = Math.max(
      8,
      Math.floor(SequencerGrid.trackButtonHeight / 4),
    );
    const shiftedIndicatorColumn = this.columnIndicatorPlaying
      ? SequencerGrid.normalizeColumnIndex(this.currentColumn + 1, steps)
      : -1;

    return html`
      ${this.columnIndicatorEnabled
        ? html`
            <div
              class="column-indicator-row"
              style="
                margin-inline-start: ${SequencerGrid.trackButtonHeight + SequencerGrid.trackButtonGap}px;
                grid-template-columns: repeat(${steps}, ${SequencerGrid.trackButtonHeight}px);
                column-gap: ${SequencerGrid.trackButtonGap}px;
              "
              aria-hidden="true"
            >
              ${repeat(
                columns,
                (column) => column,
                (column) => html`
                  <button
                    type="button"
                    class="column-indicator-button"
                    data-active=${String(
                      this.columnIndicatorPlaying &&
                        column === shiftedIndicatorColumn,
                    )}
                    style="height:${indicatorHeight}px;"
                  ></button>
                `,
              )}
            </div>
          `
        : ""}
      <ul>
        ${repeat(
          indexes,
          (i) => i,
          (i) => html`
            <li>
              <sequencer-track
                .trackId=${i}
                .stepCount=${steps}
                .selected=${this.trackSelectionById[i] ?? true}
              ></sequencer-track>
            </li>
          `
        )}
      </ul>
    `;
  }

  private static normalizePositive(value: number, fallback: number): number {
    if (!Number.isFinite(value)) return fallback;
    const normalized = Math.floor(value);
    return normalized > 0 ? normalized : fallback;
  }

  private static normalizeColumnIndex(value: number, totalColumns: number): number {
    if (totalColumns <= 0) {
      return -1;
    }

    const normalized = Math.floor(value);
    const wrapped = ((normalized % totalColumns) + totalColumns) % totalColumns;
    return wrapped;
  }

  private static createDefaultTrackProjection(
    trackId: number,
    stepCount: number,
    selected: boolean,
  ): ISequencerTrackProjection {
    return Object.freeze({
      trackId,
      selected,
      stepStates: Array.from({ length: stepCount }, () => false),
    });
  }
}
