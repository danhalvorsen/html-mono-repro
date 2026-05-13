// @vitest-environment jsdom

import { Vector2 } from "@monorepo/core-math";
import { describe, expect, it } from "vitest";

import {
  Column,
  ColumnElementTagName,
  ColumnFactory,
  ColumnSlotName,
} from "../Column.ts";
import { Constants } from "../constants.ts";

describe("Column", () => {
  it("should create twelve default slotted columns", () => {
    const columns = new ColumnFactory().createColumns();

    expect(columns).toHaveLength(Constants.numberColumns);
    expect(columns).toHaveLength(12);
    expect(columns.every((column) => column.slot === ColumnSlotName)).toBe(true);
  });

  it("should place columns from left to right using configured width and border", () => {
    const columns = new ColumnFactory().createColumns();

    expect(columns[0]?.position).toEqual(
      new Vector2(
        Constants.position.x,
        Constants.position.y + Constants.mainBorderWidth / 2,
      ),
    );

    expect(columns[1]?.position).toEqual(
      new Vector2(
        Constants.position.x +
          Constants.columnWidth +
          Constants.columnBorderWidth,
        Constants.position.y + Constants.mainBorderWidth / 2,
      ),
    );
  });

  it("should render a visible boundary rectangle inside its own svg overlay", async () => {
    const column = document.createElement(ColumnElementTagName) as Column;

    column.index = 3;
    column.position = new Vector2(10, 20);
    column.size = new Vector2(30, 40);
    column.viewSize = new Vector2(100, 100);

    document.body.appendChild(column);
    await column.updateComplete;

    const svg = column.shadowRoot?.querySelector("svg");
    const rect = column.shadowRoot?.querySelector("rect");

    expect(svg?.getAttribute("viewBox")).toBe("0 0 100 100");
    expect(rect?.getAttribute("data-column-index")).toBe("3");
    expect(rect?.getAttribute("x")).toBe("10");
    expect(rect?.getAttribute("y")).toBe("20");
    expect(rect?.getAttribute("width")).toBe("30");
    expect(rect?.getAttribute("height")).toBe("40");
    expect(rect?.getAttribute("fill")).toBe("none");
    expect(rect?.getAttribute("stroke")).toBe("#000000");
    expect(rect?.getAttribute("stroke-width")).toBe("4");

    column.remove();
  });
});
