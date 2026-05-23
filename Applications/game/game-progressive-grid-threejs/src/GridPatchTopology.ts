import type { GridPoint } from "@monorepo/game-progressive-grid";

export class GridPatchTopology {
  public readonly columnCount: number;
  public readonly rowCount: number;

  private readonly points: readonly GridPoint[];

  public constructor(
    columnCount: number,
    rowCount: number,
    points: readonly GridPoint[],
  ) {
    if (!Number.isInteger(columnCount) || columnCount < 2) {
      throw new Error("Grid topology requires at least two columns.");
    }

    if (!Number.isInteger(rowCount) || rowCount < 2) {
      throw new Error("Grid topology requires at least two rows.");
    }

    if (points.length !== columnCount * rowCount) {
      throw new Error("Grid topology point count does not match column and row count.");
    }

    this.columnCount = columnCount;
    this.rowCount = rowCount;
    this.points = Object.freeze([...points]);
  }

  public getPoints(): readonly GridPoint[] {
    return this.points;
  }

  public getPoint(columnIndex: number, rowIndex: number): GridPoint {
    if (columnIndex < 0 || columnIndex >= this.columnCount) {
      throw new Error(`Grid topology column index is outside bounds: ${columnIndex}`);
    }

    if (rowIndex < 0 || rowIndex >= this.rowCount) {
      throw new Error(`Grid topology row index is outside bounds: ${rowIndex}`);
    }

    const index = rowIndex * this.columnCount + columnIndex;
    const point = this.points[index];

    if (point === undefined) {
      throw new Error(`Missing grid topology point at index: ${index}`);
    }

    return point;
  }
}
