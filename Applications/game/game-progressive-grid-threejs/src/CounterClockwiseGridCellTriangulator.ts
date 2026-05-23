import type { IGridCellTriangulator } from "./IGridCellTriangulator.js";

export class CounterClockwiseGridCellTriangulator implements IGridCellTriangulator {
  public createIndices(columnCount: number, rowCount: number): Uint32Array {
    if (!Number.isInteger(columnCount) || columnCount < 2) {
      throw new Error("Triangulation requires at least two columns.");
    }

    if (!Number.isInteger(rowCount) || rowCount < 2) {
      throw new Error("Triangulation requires at least two rows.");
    }

    const cellCount = (columnCount - 1) * (rowCount - 1);
    const indices = new Uint32Array(cellCount * 6);

    let targetIndex = 0;

    for (let rowIndex = 0; rowIndex < rowCount - 1; rowIndex += 1) {
      for (let columnIndex = 0; columnIndex < columnCount - 1; columnIndex += 1) {
        const lowerLeft = rowIndex * columnCount + columnIndex;
        const lowerRight = lowerLeft + 1;
        const upperLeft = lowerLeft + columnCount;
        const upperRight = upperLeft + 1;

        indices[targetIndex] = lowerLeft;
        targetIndex += 1;

        indices[targetIndex] = lowerRight;
        targetIndex += 1;

        indices[targetIndex] = upperRight;
        targetIndex += 1;

        indices[targetIndex] = lowerLeft;
        targetIndex += 1;

        indices[targetIndex] = upperRight;
        targetIndex += 1;

        indices[targetIndex] = upperLeft;
        targetIndex += 1;
      }
    }

    return indices;
  }
}
