export type SequencerTransportId = "play" | "stop";
export type SequencerFeatureId = "column-indicator";
export type SequencerControlButtonTag = "play-button" | "stop-button";
export type SequencerBpm = 100 | 130 | 160;

export interface ISequencerAddress {
  readonly column: number;
  readonly row: number;
}

export interface ISequencerTrackProjection {
  readonly trackId: number;
  readonly selected: boolean;
  readonly stepStates: readonly boolean[];
}

export interface ISequencerColumnIndicatorProjection {
  readonly enabled: boolean;
  readonly playing: boolean;
  readonly currentColumn: number;
}

export interface ISequencerGridProjection {
  readonly tracks: readonly ISequencerTrackProjection[];
  readonly columnIndicator: ISequencerColumnIndicatorProjection;
}

export interface ISequencerControlProjection {
  readonly playing: boolean;
  readonly bpm: SequencerBpm;
  readonly columnIndicatorEnabled: boolean;
}

export interface ISequencerTransportRequestedDetail {
  readonly id: SequencerTransportId;
  readonly address: readonly [column: number, row: number];
}

export interface ISequencerBpmRequestedDetail {
  readonly bpm: SequencerBpm;
  readonly address: readonly [column: number, row: number];
}

export interface ISequencerFeatureToggleRequestedDetail {
  readonly id: SequencerFeatureId;
  readonly enabled: boolean;
  readonly address: readonly [column: number, row: number];
}

export interface ISequencerTrackSelectionToggleRequestedDetail {
  readonly trackId: number;
  readonly selected: boolean;
}

export interface ISequencerTrackStepToggleRequestedDetail {
  readonly trackId: number;
  readonly stepIndex: number;
  readonly enabled: boolean;
}

export const SequencerUiEvents = Object.freeze({
  transportRequested: "sequencer-control-transport-requested",
  bpmRequested: "sequencer-control-bpm-requested",
  featureToggleRequested: "sequencer-control-feature-toggle-requested",
  trackSelectionToggleRequested:
    "sequencer-track-selection-toggle-requested",
  trackStepToggleRequested: "sequencer-track-step-toggle-requested",
} as const);

export const SequencerUiGeometry = Object.freeze({
  track: Object.freeze({
    toggleWidth: 88,
    toggleHeight: 88,
    stepButtonWidth: 88,
    stepButtonHeight: 88,
    gap: 8,
  }),
  control: Object.freeze({
    buttonWidth: 88,
    buttonHeight: 56,
    gap: 8,
  }),
  indicator: Object.freeze({
    minHeight: 8,
  }),
} as const);

export class SequencerAddress {
  public readonly column: number;
  public readonly row: number;

  public constructor(column: number, row: number) {
    if (!Number.isInteger(column) || column < 0) {
      throw new Error("SequencerAddress column must be a non-negative integer.");
    }

    if (!Number.isInteger(row) || row < 0) {
      throw new Error("SequencerAddress row must be a non-negative integer.");
    }

    this.column = column;
    this.row = row;
  }

  public toTuple(): readonly [number, number] {
    return [this.column, this.row] as const;
  }

  public toAttributeValue(): string {
    return `[${this.column},${this.row}]`;
  }

  public toIdSuffix(): string {
    return `${this.column}-${this.row}`;
  }

  public static from(value: ISequencerAddress): SequencerAddress {
    return new SequencerAddress(value.column, value.row);
  }
}

export interface ITransportButtonDefinition {
  readonly id: SequencerTransportId;
  readonly tag: SequencerControlButtonTag;
  readonly address: SequencerAddress;
}

export interface IBpmButtonDefinition {
  readonly bpm: SequencerBpm;
  readonly address: SequencerAddress;
}

export interface IFeatureButtonDefinition {
  readonly id: SequencerFeatureId;
  readonly label: string;
  readonly address: SequencerAddress;
}

export const SequencerControlDefinitions = Object.freeze({
  transportButtons: Object.freeze<readonly ITransportButtonDefinition[]>([
    Object.freeze({
      id: "play",
      tag: "play-button",
      address: new SequencerAddress(0, 4),
    }),
    Object.freeze({
      id: "stop",
      tag: "stop-button",
      address: new SequencerAddress(1, 4),
    }),
  ]),
  bpmButtons: Object.freeze<readonly IBpmButtonDefinition[]>([
    Object.freeze({
      bpm: 100,
      address: new SequencerAddress(2, 4),
    }),
    Object.freeze({
      bpm: 130,
      address: new SequencerAddress(3, 4),
    }),
    Object.freeze({
      bpm: 160,
      address: new SequencerAddress(4, 4),
    }),
  ]),
  featureButtons: Object.freeze<readonly IFeatureButtonDefinition[]>([
    Object.freeze({
      id: "column-indicator",
      label: "Indicator",
      address: new SequencerAddress(5, 4),
    }),
  ]),
});

export class SequencerControlState {
  public static isTransportActive(
    projection: ISequencerControlProjection,
    id: SequencerTransportId,
  ): boolean {
    return id === "play" ? projection.playing : !projection.playing;
  }

  public static isBpmActive(
    projection: ISequencerControlProjection,
    bpm: SequencerBpm,
  ): boolean {
    return projection.bpm === bpm;
  }

  public static isFeatureActive(
    projection: ISequencerControlProjection,
    id: SequencerFeatureId,
  ): boolean {
    switch (id) {
      case "column-indicator":
        return projection.columnIndicatorEnabled;
    }
  }
}

export class SequencerEventFactory {
  public static transportRequested(
    definition: ITransportButtonDefinition,
  ): CustomEvent<ISequencerTransportRequestedDetail> {
    return new CustomEvent<ISequencerTransportRequestedDetail>(
      SequencerUiEvents.transportRequested,
      {
        detail: Object.freeze({
          id: definition.id,
          address: definition.address.toTuple(),
        }),
        bubbles: true,
        composed: true,
      },
    );
  }

  public static bpmRequested(
    definition: IBpmButtonDefinition,
  ): CustomEvent<ISequencerBpmRequestedDetail> {
    return new CustomEvent<ISequencerBpmRequestedDetail>(
      SequencerUiEvents.bpmRequested,
      {
        detail: Object.freeze({
          bpm: definition.bpm,
          address: definition.address.toTuple(),
        }),
        bubbles: true,
        composed: true,
      },
    );
  }

  public static featureToggleRequested(
    definition: IFeatureButtonDefinition,
    enabled: boolean,
  ): CustomEvent<ISequencerFeatureToggleRequestedDetail> {
    return new CustomEvent<ISequencerFeatureToggleRequestedDetail>(
      SequencerUiEvents.featureToggleRequested,
      {
        detail: Object.freeze({
          id: definition.id,
          enabled,
          address: definition.address.toTuple(),
        }),
        bubbles: true,
        composed: true,
      },
    );
  }

  public static trackSelectionToggleRequested(
    trackId: number,
    selected: boolean,
  ): CustomEvent<ISequencerTrackSelectionToggleRequestedDetail> {
    return new CustomEvent<ISequencerTrackSelectionToggleRequestedDetail>(
      SequencerUiEvents.trackSelectionToggleRequested,
      {
        detail: Object.freeze({
          trackId,
          selected,
        }),
        bubbles: true,
        composed: true,
      },
    );
  }

  public static trackStepToggleRequested(
    trackId: number,
    stepIndex: number,
    enabled: boolean,
  ): CustomEvent<ISequencerTrackStepToggleRequestedDetail> {
    return new CustomEvent<ISequencerTrackStepToggleRequestedDetail>(
      SequencerUiEvents.trackStepToggleRequested,
      {
        detail: Object.freeze({
          trackId,
          stepIndex,
          enabled,
        }),
        bubbles: true,
        composed: true,
      },
    );
  }
}

export class SequencerUiGuard {
  public static normalizePositiveInteger(value: number, fallback: number): number {
    if (!Number.isFinite(value)) {
      return fallback;
    }

    const normalized = Math.floor(value);
    return normalized > 0 ? normalized : fallback;
  }

  public static normalizeNonNegativeInteger(
    value: number,
    fallback: number,
  ): number {
    if (!Number.isFinite(value)) {
      return fallback;
    }

    const normalized = Math.floor(value);
    return normalized >= 0 ? normalized : fallback;
  }

  public static normalizeColumnIndex(
    value: number,
    totalColumns: number,
  ): number {
    if (!Number.isInteger(totalColumns) || totalColumns <= 0) {
      return -1;
    }

    const normalized = Math.floor(value);
    return ((normalized % totalColumns) + totalColumns) % totalColumns;
  }

  public static isSequencerBpm(value: number): value is SequencerBpm {
    return value === 100 || value === 130 || value === 160;
  }

  public static toDisplayDigit(trackId: number): number {
    if (!Number.isFinite(trackId)) {
      return 1;
    }

    const normalized = Math.max(0, Math.floor(trackId));
    return (normalized % 8) + 1;
  }
}