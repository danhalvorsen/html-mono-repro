import { Vector2 } from "@monorepo/core-math";
import type { ReactiveController, ReactiveControllerHost } from "lit";

import { Constants } from "../constants.ts";
import {
  Column,
  ColumnElementTagName,
  ColumnSlotName,
} from "./Column.ts";

type WaterfallColumnHost = ReactiveControllerHost & HTMLElement;

export class WaterfallColumHandling implements ReactiveController {
  private readonly host: WaterfallColumnHost;

  public constructor(host: WaterfallColumnHost) {
    this.host = host;
    this.host.addController(this);
  }

  public hostConnected(): void {
    this.ensureDefaultColumns();
  }

  public getColumn(columnIndex: number): Column {
    this.ensureDefaultColumns();
    this.assertValidColumnIndex(columnIndex);

    const column = this.getColumns().find(
      (candidate) => candidate.index === columnIndex,
    );

    if (column === undefined) {
      throw new RangeError(`Waterfall column was not found: ${columnIndex}.`);
    }

    return column;
  }

  public ensureDefaultColumns(): void {
    if (this.host.querySelector(ColumnElementTagName) !== null) {
      return;
    }

    for (let index = 0; index < Constants.numberColumns; index += 1) {
      this.host.appendChild(this.createDefaultColumn(index));
    }

    this.host.requestUpdate();
  }

  private getColumns(): readonly Column[] {
    return Array.from(this.host.querySelectorAll(ColumnElementTagName)).filter(
      (element): element is Column => element instanceof Column,
    );
  }

  private assertValidColumnIndex(columnIndex: number): void {
    if (!Number.isInteger(columnIndex)) {
      throw new RangeError(`Column index must be an integer: ${columnIndex}.`);
    }

    if (columnIndex < 0 || columnIndex >= Constants.numberColumns) {
      throw new RangeError(
        `Column index must be between 0 and ${
          Constants.numberColumns - 1
        }: ${columnIndex}.`,
      );
    }
  }

  private createDefaultColumn(index: number): Column {
    const column = document.createElement(ColumnElementTagName) as Column;

    column.slot = ColumnSlotName;
    column.index = index;
    column.position = this.createDefaultColumnPosition(index);
    column.size = new Vector2(Constants.columnWidth, Constants.columnHeight);

    return column;
  }

  private createDefaultColumnPosition(index: number): Vector2 {
    return new Vector2(
      Constants.position.x +
        index * (Constants.columnWidth + Constants.columnBorderWidth),
      Constants.position.y + Constants.mainBorderWidth / 2,
    );
  }
}
