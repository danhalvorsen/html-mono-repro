import { Vector2 } from "@monorepo/core-math";
import { html, LitElement, type TemplateResult } from "lit";
import {
  customElement,
  query,
} from "lit/decorators.js";

import { CollisionDetection } from "../collision/CollisionDetection.ts";
import { CollisionObject } from "../collision/CollisionObject.ts";
import { Constants } from "../constants.ts";
import { GravityFallingMovementStrategy } from "../moveable/GravityFallingMovementStrategy.ts";
import {
  Column,
  ColumnElementTagName,
  ColumnFactory,
  ColumnSlotName,
} from "./Column.ts";
import { GravityFalling } from "./GravityFalling.ts";
import { MovingObject } from "./MovingObject.ts";

export const WaterfallElementTagName = "waterfall-component";

@customElement(WaterfallElementTagName)
export class Waterfall extends LitElement {
  private static readonly GravityFallingTagName = "gravity-falling";
  private static readonly GravityFallingInsetPixels: number = 4;
  private static readonly MinimumGravityFallingHeightPixels: number = 16;
  private static readonly MaximumGravityFallingHeightPixels: number = 180;
  private static readonly GravityFallingHeightPixelsPerMillisecond: number = 0.08;

  private readonly collisionDetection: CollisionDetection =
    new CollisionDetection();

  private readonly columnFactory: ColumnFactory = new ColumnFactory();

  private readonly staticRectangle: CollisionObject = new CollisionObject(
    Constants.position,
    new Vector2(Constants.width, Constants.height),
  );

  private readonly activeGravityFallingByColumnIndex: Map<number, GravityFalling> =
    new Map<number, GravityFalling>();

  @query("moving-object")
  private readonly movingObjectElement!: MovingObject | null;

  @query("slot:not([name])")
  private readonly defaultSlotElement!: HTMLSlotElement | null;

  private frameId: number | null = null;
  private lastTimeMs: number | null = null;

  public override connectedCallback(): void {
    super.connectedCallback();

    this.style.position = "relative";
    this.style.display = "block";
    this.style.width = `${this.svgWidth}px`;
    this.style.height = `${this.svgHeight}px`;

    this.ensureDefaultColumns();

    this.lastTimeMs = null;
    this.frameId = requestAnimationFrame(this.onAnimationFrame);
  }

  public override disconnectedCallback(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }

    this.activeGravityFallingByColumnIndex.clear();

    super.disconnectedCallback();
  }

  public createGavityFallingObjectInColumn(
    columnIndex: number,
    heldMs: number = 0,
  ): void {
    const activeFalling = this.tryGetActiveGravityFalling(columnIndex);

    if (activeFalling !== null) {
      this.updateGavityFallingObjectHeightInColumn(columnIndex, heldMs);
      return;
    }

    const falling = this.createGravityFallingObject(columnIndex, heldMs);

    this.activeGravityFallingByColumnIndex.set(columnIndex, falling);
    this.appendChild(falling);
  }

  public updateGavityFallingObjectHeightInColumn(
    columnIndex: number,
    heldMs: number,
  ): void {
    const falling = this.tryGetActiveGravityFalling(columnIndex);

    if (falling === null) {
      return;
    }

    const column = this.getColumn(columnIndex);

    this.updateGravityFallingSize(falling, column, heldMs);
  }

  public completeGavityFallingObjectInColumn(
    columnIndex: number,
    heldMs: number,
  ): void {
    this.updateGavityFallingObjectHeightInColumn(columnIndex, heldMs);

    // Release the object. It can now fall on the next animation frame.
    this.activeGravityFallingByColumnIndex.delete(columnIndex);
  }

  public cancelGavityFallingObjectInColumn(columnIndex: number): void {
    const falling = this.tryGetActiveGravityFalling(columnIndex);

    if (falling !== null) {
      falling.remove();
    }

    this.activeGravityFallingByColumnIndex.delete(columnIndex);
  }

  protected override render(): TemplateResult {
    return html`
      <svg
        width=${this.svgWidth}
        height=${this.svgHeight}
        viewBox="0 0 ${this.svgWidth} ${this.svgHeight}"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x=${this.staticRectangle.position.x}
          y=${this.staticRectangle.position.y}
          width=${this.staticRectangle.size.x}
          height=${this.staticRectangle.size.y}
          fill="yellow"
          stroke="red"
          stroke-width=${Constants.mainBorderWidth}
        ></rect>
      </svg>

      <slot name=${ColumnSlotName}></slot>

      <moving-object
        .container=${this.staticRectangle}
        .collisionDetection=${this.collisionDetection}
      ></moving-object>

      <slot></slot>
    `;
  }

  private createGravityFallingObject(
    columnIndex: number,
    heldMs: number,
  ): GravityFalling {
    const column = this.getColumn(columnIndex);
    const columnContainer = new CollisionObject(column.position, column.size);
    const strategy = new GravityFallingMovementStrategy();

    strategy.container = columnContainer;
    strategy.inset = Waterfall.GravityFallingInsetPixels;
    strategy.size = this.createGravityFallingSize(column, heldMs);

    const falling = document.createElement(
      Waterfall.GravityFallingTagName,
    ) as GravityFalling;

    falling.container = columnContainer;
    falling.strategy = strategy;

    return falling;
  }

  private updateGravityFallingSize(
    falling: GravityFalling,
    column: Column,
    heldMs: number,
  ): void {
    falling.strategy.size = this.createGravityFallingSize(column, heldMs);
    falling.requestUpdate();
  }

  private createGravityFallingSize(
    column: Column,
    heldMs: number,
  ): Vector2 {
    return new Vector2(
      this.calculateGravityFallingWidth(column),
      this.calculateGravityFallingHeight(column, heldMs),
    );
  }

  private calculateGravityFallingWidth(column: Column): number {
    const insetWidth = Waterfall.GravityFallingInsetPixels * 2;

    return Math.max(1, column.size.x - insetWidth);
  }

  private calculateGravityFallingHeight(
    column: Column,
    heldMs: number,
  ): number {
    const safeHeldMs = Number.isFinite(heldMs) ? Math.max(0, heldMs) : 0;
    const requestedHeight =
      safeHeldMs * Waterfall.GravityFallingHeightPixelsPerMillisecond;

    const availableHeight = Math.max(
      1,
      column.size.y - Waterfall.GravityFallingInsetPixels * 2,
    );

    const maximumHeight = Math.max(
      1,
      Math.min(
        Waterfall.MaximumGravityFallingHeightPixels,
        availableHeight,
      ),
    );

    const minimumHeight = Math.min(
      Waterfall.MinimumGravityFallingHeightPixels,
      maximumHeight,
    );

    return Math.min(
      maximumHeight,
      Math.max(minimumHeight, requestedHeight),
    );
  }

  private tryGetActiveGravityFalling(
    columnIndex: number,
  ): GravityFalling | null {
    const falling = this.activeGravityFallingByColumnIndex.get(columnIndex);

    if (falling === undefined) {
      return null;
    }

    if (!falling.isConnected) {
      this.activeGravityFallingByColumnIndex.delete(columnIndex);
      return null;
    }

    return falling;
  }

  private isPressedGravityFalling(falling: GravityFalling): boolean {
    for (const pressedFalling of this.activeGravityFallingByColumnIndex.values()) {
      if (pressedFalling === falling) {
        return true;
      }
    }

    return false;
  }

  private removeActiveGravityFallingReference(falling: GravityFalling): void {
    for (const [
      columnIndex,
      activeFalling,
    ] of this.activeGravityFallingByColumnIndex) {
      if (activeFalling === falling) {
        this.activeGravityFallingByColumnIndex.delete(columnIndex);
      }
    }
  }

  private getColumn(columnIndex: number): Column {
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

  private getColumns(): readonly Column[] {
    return Array.from(this.querySelectorAll(ColumnElementTagName)).filter(
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

  private ensureDefaultColumns(): void {
    if (this.querySelector(ColumnElementTagName) !== null) {
      return;
    }

    for (const column of this.columnFactory.createColumns()) {
      this.appendChild(column);
    }
  }

  private get svgWidth(): number {
    return Constants.position.x + Constants.width + Constants.mainBorderWidth;
  }

  private get svgHeight(): number {
    return Constants.position.y + Constants.height + Constants.mainBorderWidth;
  }

  private readonly onAnimationFrame = (timeMs: number): void => {
    const deltaSeconds =
      this.lastTimeMs === null ? 0 : (timeMs - this.lastTimeMs) / 1000;

    this.lastTimeMs = timeMs;

    this.movingObjectElement?.updateMovement(deltaSeconds);
    this.updateGravityFallingObjects(deltaSeconds);

    this.frameId = requestAnimationFrame(this.onAnimationFrame);
  };

  private updateGravityFallingObjects(deltaSeconds: number): void {
    for (const falling of this.getGravityFallingObjects()) {
      if (this.isPressedGravityFalling(falling)) {
        continue;
      }

      falling.updateMovement(deltaSeconds);

      if (falling.completed) {
        this.removeActiveGravityFallingReference(falling);
        falling.remove();
      }
    }
  }

  private getGravityFallingObjects(): readonly GravityFalling[] {
    if (this.defaultSlotElement === null) {
      return [];
    }

    return this.defaultSlotElement.assignedElements({ flatten: true }).filter(
      (element): element is GravityFalling =>
        element instanceof GravityFalling,
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "waterfall-component": Waterfall;
  }
}
