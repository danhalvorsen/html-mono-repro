import type { GridPoint, IGridPatch } from "@monorepo/game-progressive-grid";

export type GridPointProjectionContext = Readonly<{
  readonly patch: IGridPatch;
  readonly point: GridPoint;
  readonly columnIndex: number;
  readonly rowIndex: number;
  readonly columnCount: number;
  readonly rowCount: number;
  readonly linearIndex: number;
}>;
