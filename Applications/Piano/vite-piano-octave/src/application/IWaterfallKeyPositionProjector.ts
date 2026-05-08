export interface WaterfallKeyPosition {
  readonly centerRatio: number;
  readonly widthRatio: number;
}

export interface IWaterfallKeyPositionProjector {
  project(
    note: string,
    octaveIndex: number,
    octaveCount: number
  ): WaterfallKeyPosition | null;
}

