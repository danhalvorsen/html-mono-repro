export interface IGridCellTriangulator {
  createIndices(columnCount: number, rowCount: number): Uint32Array;
}
