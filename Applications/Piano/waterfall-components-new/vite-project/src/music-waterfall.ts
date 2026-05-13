import { Vector2 } from "@monorepo/core-math";
import { html, LitElement, type TemplateResult } from "lit";
import {
  customElement,
  query,
  queryAssignedElements,
} from "lit/decorators.js";

import { CollisionDetection } from "./CollisionDetection.ts";
import { CollisionObject } from "./CollisionObject.ts";
import { Column, ColumnFactory } from "./Column.ts";
import { Constants } from "./constants.ts";
import {
  DirectionalMovementPlan,
  GravityFalling,
} from "./GravityFalling.ts";
import { MovingObject } from "./MovingObject.ts";

export const WaterfallElementTagName = "waterfall-component";

@customElement(WaterfallElementTagName)
export class Waterfall extends LitElement {
  private static readonly GravityFallingTagName = "gravity-falling";

  private readonly collisionDetection: CollisionDetection =
    new CollisionDetection();

  private readonly staticRectangle: CollisionObject = new CollisionObject(
    Constants.position,
    new Vector2(Constants.width, Constants.height),
  );

  private readonly columns: readonly Column[] =
    new ColumnFactory().createColumns();

  @query("moving-object")
  private readonly movingObjectElement!: MovingObject | null;

  @queryAssignedElements({ flatten: true })
  private readonly assignedElements!: readonly Element[];

  private frameId: number | null = null;
  private lastTimeMs: number | null = null;

  public override connectedCallback(): void {
    super.connectedCallback();

    this.style.position = "relative";
    this.style.display = "block";
    this.style.width = `${this.svgWidth}px`;
    this.style.height = `${this.svgHeight}px`;

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

  public addDirectionalMovementPlan(
    movementPlan: DirectionalMovementPlan,
  ): void {
    const falling = document.createElement(
      Waterfall.GravityFallingTagName,
    ) as GravityFalling;

    falling.container = this.staticRectangle;
    falling.movementPlan = movementPlan;

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

        ${this.columns.map((column) => column.render())}
      </svg>

      <moving-object
        .container=${this.staticRectangle}
        .collisionDetection=${this.collisionDetection}
      ></moving-object>

      <slot></slot>
    `;
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
    return this.assignedElements.filter(
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
