import { Vector2 } from "@monorepo/core-math";
import { html, LitElement, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

import { Constants } from "./constants.ts";

export const ColumnElementTagName = "waterfall-column";
export const ColumnSlotName = "columns";

@customElement(ColumnElementTagName)
export class Column extends LitElement {
  private static readonly BoundaryFill: string = "none";
  private static readonly BoundaryStroke: string = "#000000";
  private static readonly BoundaryStrokeWidth: number = 4;

  @property({ type: Number })
  public index: number = 0;

  @property({ attribute: false })
  public position: Vector2 = Constants.position;

  @property({ attribute: false })
  public size: Vector2 = new Vector2(
    Constants.columnWidth,
    Constants.columnHeight,
  );

  @property({ attribute: false })
  public viewSize: Vector2 = new Vector2(
    Constants.position.x + Constants.width + Constants.mainBorderWidth,
    Constants.position.y + Constants.height + Constants.mainBorderWidth,
  );

  public override connectedCallback(): void {
    super.connectedCallback();

    this.style.position = "absolute";
    this.style.left = "0";
    this.style.top = "0";
    this.style.display = "block";
    this.style.pointerEvents = "none";
    this.style.width = `${this.viewSize.x}px`;
    this.style.height = `${this.viewSize.y}px`;
  }

  protected override render(): TemplateResult {
    return html`
      <svg
        width=${this.viewSize.x}
        height=${this.viewSize.y}
        viewBox="0 0 ${this.viewSize.x} ${this.viewSize.y}"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          data-column-index=${this.index}
          x=${this.position.x}
          y=${this.position.y}
          width=${this.size.x}
          height=${this.size.y}
          fill=${Column.BoundaryFill}
          stroke=${Column.BoundaryStroke}
          stroke-width=${Column.BoundaryStrokeWidth}
          vector-effect="non-scaling-stroke"
        ></rect>
      </svg>
    `;
  }
}

export class ColumnFactory {
  public createColumns(): readonly Column[] {
    return Array.from(
      { length: Constants.numberColumns },
      (_, index) => this.createColumn(index),
    );
  }

  private createColumn(index: number): Column {
    const column = document.createElement(ColumnElementTagName) as Column;

    column.slot = ColumnSlotName;
    column.index = index;
    column.position = this.createColumnPosition(index);
    column.size = new Vector2(Constants.columnWidth, Constants.columnHeight);
    column.viewSize = new Vector2(
      Constants.position.x + Constants.width + Constants.mainBorderWidth,
      Constants.position.y + Constants.height + Constants.mainBorderWidth,
    );

    return column;
  }

  private createColumnPosition(index: number): Vector2 {
    return new Vector2(
      Constants.position.x +
        index * (Constants.columnWidth + Constants.columnBorderWidth),
      Constants.position.y + Constants.mainBorderWidth / 2,
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "waterfall-column": Column;
  }
}
