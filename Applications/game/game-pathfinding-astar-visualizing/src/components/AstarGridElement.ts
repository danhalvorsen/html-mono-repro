import { LitElement, css, html } from "lit";
import type {
  CellClickEventDetail,
  CellDropEventDetail,
  CellDragEventDetail,
  GridCoordinate,
  GridSnapshot,
  PlacementMode,
} from "../contracts/AstarVisualizerContracts.js";
import {
  AstarDomEventNames,
  createEmptyCellState,
} from "../contracts/AstarVisualizerContracts.js";
import { AstarGridInteractionController } from "../controllers/AstarGridInteractionController.js";
import { dispatchAstarEvent } from "../events/dispatchAstarEvent.js";
import "./AstarCellElement.js";

export class AstarGridElement extends LitElement {
  public static override readonly properties = {
    gridSnapshot: { attribute: false },
    rows: { type: Number },
    cols: { type: Number },
    cellSize: { type: Number, attribute: "cell-size" },
    showCosts: { type: Boolean, attribute: "show-costs" },
    placementMode: { type: String, attribute: "placement-mode" },
  };

  public static override readonly styles = css`
    :host {
      display: block;
      overflow: auto;
    }

    .grid {
      display: grid;
      width: max-content;
      border: 1px solid #d0d7de;
      background: #d0d7de;
      touch-action: none;
    }
  `;

  private readonly interactionController: AstarGridInteractionController;

  public declare gridSnapshot: GridSnapshot;
  public declare rows: number;
  public declare cols: number;
  public declare cellSize: number;
  public declare showCosts: boolean;
  public declare placementMode: PlacementMode;

  public constructor() {
    super();

    this.gridSnapshot = [];
    this.rows = 10;
    this.cols = 10;
    this.cellSize = 24;
    this.showCosts = false;
    this.placementMode = "wall";

    this.interactionController = new AstarGridInteractionController(this);
  }

  public emitCellClick(detail: CellClickEventDetail): void {
    dispatchAstarEvent(this, AstarDomEventNames.CellClick, detail);
  }

  public emitCellDrag(detail: CellDragEventDetail): void {
    dispatchAstarEvent(this, AstarDomEventNames.CellDrag, detail);
  }

  public emitCellDrop(detail: CellDropEventDetail): void {
    dispatchAstarEvent(this, AstarDomEventNames.CellDrop, detail);
  }

  protected override render() {
    const rows = this.effectiveRows;
    const cols = this.effectiveCols;
    const style = [
      `grid-template-columns: repeat(${cols}, ${this.cellSize}px)`,
      `--astar-cell-size: ${this.cellSize}px`,
    ].join(";");

    return html`
      <div
        class="grid"
        role="grid"
        aria-rowcount=${rows}
        aria-colcount=${cols}
        style=${style}
        @pointerdown=${this.handlePointerDown}
        @pointermove=${this.handlePointerMove}
        @pointerup=${this.handlePointerUp}
        @pointerleave=${this.handlePointerUp}
        @dragover=${this.handleDragOver}
        @drop=${this.handleDrop}
      >
        ${Array.from({ length: rows }, (_, rowIndex) =>
          Array.from({ length: cols }, (_, colIndex) =>
            this.renderCell(rowIndex, colIndex),
          ),
        )}
      </div>
    `;
  }

  private renderCell(row: number, col: number) {
    return html`
      <astar-cell
        .row=${row}
        .col=${col}
        .state=${this.getCellState(row, col)}
        .showCosts=${this.showCosts}
      ></astar-cell>
    `;
  }

  private getCellState(row: number, col: number) {
    return this.gridSnapshot[row]?.[col] ?? createEmptyCellState();
  }

  private get effectiveRows(): number {
    return this.gridSnapshot.length > 0 ? this.gridSnapshot.length : this.rows;
  }

  private get effectiveCols(): number {
    const firstRow = this.gridSnapshot[0];

    return firstRow === undefined || firstRow.length === 0
      ? this.cols
      : firstRow.length;
  }

  private handlePointerDown = (event: PointerEvent): void => {
    this.interactionController.handlePointerDown(event);
  };

  private handlePointerMove = (event: PointerEvent): void => {
    this.interactionController.handlePointerMove(event);
  };

  private handlePointerUp = (event: PointerEvent): void => {
    this.interactionController.handlePointerUp(event);
  };

  public handleDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  public handleDrop(event: DragEvent): void {
    event.preventDefault();

    const obstacleType = event.dataTransfer?.getData("text/plain") ?? "wall";
    const coordinate = this.getCoordinateFromEvent(event);
    if (coordinate === null) {
      return;
    }

    this.emitCellDrop({
      row: coordinate.row,
      col: coordinate.col,
      obstacleType,
    });
  }

  private getCoordinateFromEvent(event: Event): GridCoordinate | null {
    const cell = event.composedPath().find((target) => {
      if (!(target instanceof HTMLElement)) {
        return false;
      }

      return target.tagName.toLowerCase() === "astar-cell";
    });

    if (!(cell instanceof HTMLElement)) {
      return null;
    }

    const candidate = cell as HTMLElement & { readonly row?: unknown; readonly col?: unknown };
    if (
      typeof candidate.row !== "number"
      || typeof candidate.col !== "number"
      || !Number.isInteger(candidate.row)
      || !Number.isInteger(candidate.col)
    ) {
      return null;
    }

    return { row: candidate.row, col: candidate.col };
  }
}

if (!customElements.get("astar-grid")) {
  customElements.define("astar-grid", AstarGridElement);
}

declare global {
  interface HTMLElementTagNameMap {
    "astar-grid": AstarGridElement;
  }
}
