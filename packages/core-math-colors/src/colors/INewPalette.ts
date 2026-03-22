export interface INewPalette<TColor> {
  readonly count: number;

  getAt(index: number): TColor;
  getAll(): readonly TColor[];
}