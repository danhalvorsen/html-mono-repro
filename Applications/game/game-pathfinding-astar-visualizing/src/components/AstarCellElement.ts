import { LitElement, css, html, nothing } from "lit";
import type { CellState, ParentDirection } from "../contracts/AstarVisualizerContracts.js";
import { createEmptyCellState } from "../contracts/AstarVisualizerContracts.js";

export class AstarCellElement extends LitElement {
  public static override readonly properties = {
    state: { attribute: false },
    showCosts: { type: Boolean, attribute: "show-costs" },
    row: { type: Number },
    col: { type: Number },
  };

  public static override readonly styles = css`
    :host {
      display: block;
      box-sizing: border-box;
      width: var(--astar-cell-size, 24px);
      height: var(--astar-cell-size, 24px);
      user-select: none;
    }

    .cell {
      position: relative;
      box-sizing: border-box;
      width: 100%;
      height: 100%;
      border: 1px solid #d0d7de;
      background: #ffffff;
      color: #24292f;
      font-family: ui-sans-serif, system-ui, sans-serif;
      overflow: hidden;
    }

    .cell.role-start {
      background: #7ee787;
    }

    .cell.role-goal {
      background: #ff8182;
    }

    .cell.role-wall {
      background: #24292f;
      color: #ffffff;
    }

    .cell.role-wall.wall-cost-25 {
      background: #e5e5e5;
      color: #0d0d0d;
    }

    .cell.role-wall.wall-cost-50 {
      background: #b8b8b8;
      color: #111111;
    }

    .cell.role-wall.wall-cost-75 {
      background: #7a7a7a;
      color: #f0f0f0;
    }

    .cell.role-wall.wall-cost-100 {
      background: #3a3a3a;
      color: #f7f7f7;
    }

    .cell.visit-open {
      outline: inset 0 0 0 9999px rgba(46, 160, 67, 0.18);
    }

    .cell.visit-closed {
      outline: inset 0 0 0 9999px rgba(84, 174, 255, 0.18);
    }

    .cell.visit-current {
      outline: 2px solid #bf8700;
      z-index: 1;
    }

    .cell.visit-path {
      background: #d29922;
      color: #24292f;
    }

    .costs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      width: 100%;
      height: 100%;
      font-size: 0.52rem;
      line-height: 1;
    }

    .g {
      align-self: start;
      justify-self: start;
      padding: 1px;
    }

    .h {
      align-self: start;
      justify-self: end;
      padding: 1px;
    }

    .f {
      grid-column: 1 / span 2;
      align-self: end;
      justify-self: center;
      padding: 1px;
      font-weight: 700;
    }

    .arrow {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      font-size: 0.7rem;
      pointer-events: none;
    }
  `;

  public declare state: CellState;
  public declare showCosts: boolean;
  public declare row: number;
  public declare col: number;

  public constructor() {
    super();
    this.state = createEmptyCellState();
    this.showCosts = false;
    this.row = 0;
    this.col = 0;
  }

  protected override render() {
    const className = [
      "cell",
      `role-${this.state.role}`,
      `visit-${this.state.visitState}`,
      this.getWallCostClass(),
    ].join(" ");

    return html`
      <div
        class=${className}
        role="gridcell"
        aria-rowindex=${this.row + 1}
        aria-colindex=${this.col + 1}
        aria-label=${this.createAriaLabel()}
      >
        ${this.renderCosts()}
        ${this.renderParentDirection()}
      </div>
    `;
  }

  private renderCosts() {
    if (!this.showCosts) {
      return nothing;
    }

    return html`
      <div class="costs" aria-hidden="true">
        <span class="g">${this.formatCost(this.state.g)}</span>
        <span class="h">${this.formatCost(this.state.h)}</span>
        <span class="f">${this.formatCost(this.state.f)}</span>
      </div>
    `;
  }

  private renderParentDirection() {
    if (this.state.parentDirection === null) {
      return nothing;
    }

    return html`
      <span class="arrow" aria-hidden="true">
        ${this.getDirectionArrow(this.state.parentDirection)}
      </span>
    `;
  }

  private formatCost(value: number | null): string {
    return value === null ? "" : String(value);
  }

  private createAriaLabel(): string {
    return `row ${this.row + 1}, column ${this.col + 1}, role ${this.state.role}, state ${this.state.visitState}`;
  }

  private getDirectionArrow(direction: ParentDirection): string {
    const arrows: Record<ParentDirection, string> = {
      north: "↑",
      "north-east": "↗",
      east: "→",
      "south-east": "↘",
      south: "↓",
      "south-west": "↙",
      west: "←",
      "north-west": "↖",
    };

    return arrows[direction];
  }

  private getWallCostClass(): string {
    if (this.state.role !== "wall") {
      return "";
    }

    const cost = this.state.g;
    if (cost === 25) {
      return "wall-cost-25";
    }

    if (cost === 50) {
      return "wall-cost-50";
    }

    if (cost === 75) {
      return "wall-cost-75";
    }

    if (cost === 100) {
      return "wall-cost-100";
    }

    return "";
  }
}

if (!customElements.get("astar-cell")) {
  customElements.define("astar-cell", AstarCellElement);
}

declare global {
  interface HTMLElementTagNameMap {
    "astar-cell": AstarCellElement;
  }
}
