import { Vector2 } from "@monorepo/core-math";
import { html, LitElement, type TemplateResult } from "lit";
import {
  customElement,
  query,
} from "lit/decorators.js";

import { CollisionDetection } from "../collision/CollisionDetection.ts";
import { CollisionObject } from "../collision/CollisionObject.ts";
import { Constants } from "../constants.ts";
import type { GravityFallingMovementStrategy } from "../moveable/GravityFallingMovementStrategy.ts";
import {
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

  private readonly collisionDetection: CollisionDetection =
    new CollisionDetection();

  private readonly columnFactory: ColumnFactory = new ColumnFactory();

  private readonly staticRectangle: CollisionObject = new CollisionObject(
    Constants.position,
    new Vector2(Constants.width, Constants.height),
  );

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

    super.disconnectedCallback();
  }

  public addMovementStrategy(
    strategy: GravityFallingMovementStrategy,
  ): void {
    const falling = document.createElement(
      Waterfall.GravityFallingTagName,
    ) as GravityFalling;

    falling.container = this.staticRectangle;
    falling.strategy = strategy;

    this.appendChild(falling);
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
      falling.updateMovement(deltaSeconds);

      if (falling.completed) {
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
