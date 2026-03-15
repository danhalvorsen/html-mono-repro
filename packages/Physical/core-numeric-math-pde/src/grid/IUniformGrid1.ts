// ============================================================
// GRID CONTRACTS
// ============================================================

export interface IUniformGrid1 {
  readonly size: number;
  readonly spacing: number;
  readonly origin: number;
  readonly length: number;

  isInside(i: number): boolean;
  coordinateAt(i: number): number;
}
