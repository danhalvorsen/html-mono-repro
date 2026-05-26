import {
  type CellState,
  type GridCellPatch,
  type GridDiff,
  type GridSnapshot,
  isValidGridCoordinate,
} from "../contracts/AstarVisualizerContracts.js";

export interface IGridDiffApplier {
  apply(snapshot: GridSnapshot, diff: GridDiff): GridSnapshot;
}

export class DefaultGridDiffApplier implements IGridDiffApplier {
  public apply(snapshot: GridSnapshot, diff: GridDiff): GridSnapshot {
    const nextSnapshot = this.cloneSnapshot(snapshot);

    for (const patch of diff) {
      this.applyPatch(nextSnapshot, patch);
    }

    return nextSnapshot;
  }

  private cloneSnapshot(snapshot: GridSnapshot): CellState[][] {
    return snapshot.map((row) =>
      row.map((cell) => ({
        role: cell.role,
        visitState: cell.visitState,
        g: cell.g,
        h: cell.h,
        f: cell.f,
        parentDirection: cell.parentDirection,
      })),
    );
  }

  private applyPatch(snapshot: CellState[][], patch: GridCellPatch): void {
    if (!isValidGridCoordinate(snapshot, patch)) {
      throw new Error("Grid patch coordinate is outside the snapshot bounds.");
    }

    const row = snapshot[patch.row];
    const current = row?.[patch.col];

    if (row === undefined || current === undefined) {
      throw new Error("Grid patch coordinate is outside the snapshot bounds.");
    }

    let nextRole = current.role;
    let nextVisitState = current.visitState;
    let nextG = current.g;
    let nextH = current.h;
    let nextF = current.f;
    let nextParentDirection = current.parentDirection;

    if ("role" in patch && patch.role !== undefined) {
      nextRole = patch.role;
    }

    if ("visitState" in patch && patch.visitState !== undefined) {
      nextVisitState = patch.visitState;
    }

    if ("g" in patch) {
      nextG = patch.g ?? null;
    }

    if ("h" in patch) {
      nextH = patch.h ?? null;
    }

    if ("f" in patch) {
      nextF = patch.f ?? null;
    }

    if ("parentDirection" in patch) {
      nextParentDirection = patch.parentDirection ?? null;
    }

    row[patch.col] = {
      role: nextRole,
      visitState: nextVisitState,
      g: nextG,
      h: nextH,
      f: nextF,
      parentDirection: nextParentDirection,
    };
  }
}
