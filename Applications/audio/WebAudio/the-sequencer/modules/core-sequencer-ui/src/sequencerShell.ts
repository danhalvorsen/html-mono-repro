import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import "./sequencerControl.js";
import "./sequencerGrid.js";
import {
  SequencerUiEvents,
  type ISequencerBpmRequestedDetail,
  type ISequencerControlProjection,
  type ISequencerFeatureToggleRequestedDetail,
  type ISequencerGridProjection,
  type ISequencerTrackProjection,
  type ISequencerTrackSelectionToggleRequestedDetail,
  type ISequencerTrackStepToggleRequestedDetail,
  type ISequencerTransportRequestedDetail,
} from "./ui-contract.js";

@customElement("sequencer-shell")
export class SequencerShell extends LitElement {
  @state()
  private _control: ISequencerControlProjection = Object.freeze({
    playing: false,
    bpm: 130,
    columnIndicatorEnabled: false,
  });

  @state()
  private _grid: ISequencerGridProjection = Object.freeze({
    tracks: Object.freeze([
      SequencerShell.createTrackProjection(0),
      SequencerShell.createTrackProjection(1),
    ]),
    columnIndicator: Object.freeze({
      enabled: false,
      playing: false,
      currentColumn: -1,
    }),
  });

  public override render() {
    return html`
      <sequencer-control
        .projection=${this._control}
        @${SequencerUiEvents.transportRequested}=${this.handleTransportRequested}
        @${SequencerUiEvents.bpmRequested}=${this.handleBpmRequested}
        @${SequencerUiEvents.featureToggleRequested}=${this.handleFeatureToggleRequested}
      ></sequencer-control>

      <sequencer-grid
        .projection=${this._grid}
        @${SequencerUiEvents.trackSelectionToggleRequested}=${this.handleTrackSelectionToggleRequested}
        @${SequencerUiEvents.trackStepToggleRequested}=${this.handleTrackStepToggleRequested}
      ></sequencer-grid>
    `;
  }

  private readonly handleTransportRequested = (
    event: CustomEvent<ISequencerTransportRequestedDetail>,
  ): void => {
    const nextPlaying = event.detail.id === "play";

    this._control = Object.freeze({
      ...this._control,
      playing: nextPlaying,
    });

    this._grid = Object.freeze({
      ...this._grid,
      columnIndicator: Object.freeze({
        ...this._grid.columnIndicator,
        playing: nextPlaying,
      }),
    });
  };

  private readonly handleBpmRequested = (
    event: CustomEvent<ISequencerBpmRequestedDetail>,
  ): void => {
    this._control = Object.freeze({
      ...this._control,
      bpm: event.detail.bpm,
    });
  };

  private readonly handleFeatureToggleRequested = (
    event: CustomEvent<ISequencerFeatureToggleRequestedDetail>,
  ): void => {
    if (event.detail.id !== "column-indicator") {
      return;
    }

    this._control = Object.freeze({
      ...this._control,
      columnIndicatorEnabled: event.detail.enabled,
    });

    this._grid = Object.freeze({
      ...this._grid,
      columnIndicator: Object.freeze({
        ...this._grid.columnIndicator,
        enabled: event.detail.enabled,
      }),
    });
  };

  private readonly handleTrackSelectionToggleRequested = (
    event: CustomEvent<ISequencerTrackSelectionToggleRequestedDetail>,
  ): void => {
    this._grid = Object.freeze({
      ...this._grid,
      tracks: Object.freeze(
        this._grid.tracks.map((track) =>
          track.trackId === event.detail.trackId
            ? Object.freeze({
                ...track,
                selected: event.detail.selected,
              })
            : track,
        ),
      ),
    });
  };

  private readonly handleTrackStepToggleRequested = (
    event: CustomEvent<ISequencerTrackStepToggleRequestedDetail>,
  ): void => {
    this._grid = Object.freeze({
      ...this._grid,
      tracks: Object.freeze(
        this._grid.tracks.map((track) => {
          if (track.trackId !== event.detail.trackId) {
            return track;
          }

          const nextStates = track.stepStates.map((value, index) =>
            index === event.detail.stepIndex ? event.detail.enabled : value,
          );

          return Object.freeze({
            ...track,
            stepStates: Object.freeze(nextStates),
          }) as ISequencerTrackProjection;
        }),
      ),
    });
  };

  private static createTrackProjection(trackId: number): ISequencerTrackProjection {
    return Object.freeze({
      trackId,
      selected: true,
      stepStates: Object.freeze(Array.from({ length: 16 }, () => false)),
    });
  }
}