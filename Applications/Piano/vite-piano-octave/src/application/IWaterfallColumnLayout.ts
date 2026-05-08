export interface IWaterfallColumnLayout {
  getColumnWidthRatios(octaveCount: number): readonly number[];
  getColumnStartRatio(column: number, octaveCount: number): number | null;
  getColumnWidthRatio(column: number, octaveCount: number): number | null;
}

