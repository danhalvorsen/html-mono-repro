import type { ReactiveController, ReactiveControllerHost } from "lit";
import type {
  CellClickEventDetail,
  CellDragEventDetail,
  GridCoordinate,
} from "../contracts/AstarVisualizerContracts.js";

type AstarCellElementLike = HTMLElement & {
  readonly row: number;
  readonly col: number;
};

export interface IAstarGridInteractionHost extends ReactiveControllerHost {
  emitCellClick(detail: CellClickEventDetail): void;
  emitCellDrag(detail: CellDragEventDetail): void;
}

export class AstarGridInteractionController implements ReactiveController {
  private readonly host: IAstarGridInteractionHost;
  private isDragging = false;
  private hasMoved = false;
  private lastCoordinate: GridCoordinate | null = null;

  public constructor(host: IAstarGridInteractionHost) {
    this.host = host;
    this.host.addController(this);
  }

  public handlePointerDown(event: PointerEvent): void {
    if (event.button !== 0) {
      return;
    }

    const coordinate = this.getCoordinateFromEvent(event);

    if (coordinate === null) {
      return;
    }

    this.isDragging = true;
    this.hasMoved = false;
    this.lastCoordinate = coordinate;

    this.host.emitCellDrag({
      row: coordinate.row,
      col: coordinate.col,
      phase: "start",
    });
  }

  public handlePointerMove(event: PointerEvent): void {
    if (!this.isDragging || event.buttons !== 1) {
      return;
    }

    const coordinate = this.getCoordinateFromEvent(event);

    if (coordinate === null) {
      return;
    }

    if (this.isSameCoordinate(coordinate, this.lastCoordinate)) {
      return;
    }

    this.hasMoved = true;
    this.lastCoordinate = coordinate;

    this.host.emitCellDrag({
      row: coordinate.row,
      col: coordinate.col,
      phase: "move",
    });
  }

  public handlePointerUp(event: PointerEvent): void {
    if (!this.isDragging) {
      return;
    }

    const coordinate = this.getCoordinateFromEvent(event) ?? this.lastCoordinate;

    this.isDragging = false;

    if (coordinate === null) {
      this.lastCoordinate = null;
      return;
    }

    this.host.emitCellDrag({
      row: coordinate.row,
      col: coordinate.col,
      phase: "end",
    });

    if (!this.hasMoved) {
      this.host.emitCellClick({
        row: coordinate.row,
        col: coordinate.col,
      });
    }

    this.hasMoved = false;
    this.lastCoordinate = null;
  }

  public hostDisconnected(): void {
    this.isDragging = false;
    this.hasMoved = false;
    this.lastCoordinate = null;
  }

  private getCoordinateFromEvent(event: Event): GridCoordinate | null {
    const cell = event.composedPath().find((target) => this.isAstarCell(target));

    if (cell === undefined) {
      return null;
    }

    return {
      row: cell.row,
      col: cell.col,
    };
  }

  private isAstarCell(target: EventTarget): target is AstarCellElementLike {
    if (!(target instanceof HTMLElement)) {
      return false;
    }

    if (target.tagName.toLowerCase() !== "astar-cell") {
      return false;
    }

    const candidate = target as HTMLElement & {
      readonly row?: unknown;
      readonly col?: unknown;
    };

    return (
      typeof candidate.row === "number" &&
      typeof candidate.col === "number" &&
      Number.isInteger(candidate.row) &&
      Number.isInteger(candidate.col)
    );
  }

  private isSameCoordinate(
    current: GridCoordinate,
    previous: GridCoordinate | null,
  ): boolean {
    return previous?.row === current.row && previous.col === current.col;
  }
}
