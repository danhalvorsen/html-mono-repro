import { Vector2 } from "@monorepo/core-math";
import { html, LitElement, type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

import { CollisionDetection } from "./CollisionDetection.ts";
import { CollisionObject } from "./CollisionObject.ts";
import {
  DirectionalMovementPlan,
  GravityFalling,
} from "./GravityFalling.ts";
import { MovingObject } from "./MovingObject.ts";

@customElement("waterfall-component")
export class Waterfall extends LitElement {
  private readonly collisionDetection: CollisionDetection =
    new CollisionDetection();

  private readonly staticRectangle: CollisionObject = new CollisionObject(
    new Vector2(10, 10),
    new Vector2(200, 500),
  );

  private readonly gravityMovementPlan: DirectionalMovementPlan =
    new DirectionalMovementPlan(
      new Vector2(0, 1),
      0,
      320,
    );

  private frameId: number | null = null;
  private lastTimeMs: number | null = null;

  public override connectedCallback(): void {
    super.connectedCallback();

    this.style.position = "relative";
    this.style.display = "block";
    this.style.width = `${this.staticRectangle.right + 20}px`;
    this.style.height = `${this.staticRectangle.bottom + 20}px`;

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

  public addGravityFalling(): void {
    const falling = document.createElement("gravity-falling") as GravityFalling;

    falling.container = this.staticRectangle;
    falling.movementPlan = this.gravityMovementPlan;

    this.appendChild(falling);
  }

  protected override render(): TemplateResult {
    const svgWidth = this.staticRectangle.right + 20;
    const svgHeight = this.staticRectangle.bottom + 20;

    return html`
      <svg
        width=${svgWidth}
        height=${svgHeight}
        viewBox="0 0 ${svgWidth} ${svgHeight}"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x=${this.staticRectangle.position.x}
          y=${this.staticRectangle.position.y}
          width=${this.staticRectangle.size.x}
          height=${this.staticRectangle.size.y}
          fill="yellow"
          stroke="red"
          stroke-width="4"
        ></rect>
      </svg>

      <moving-object
        .container=${this.staticRectangle}
        .collisionDetection=${this.collisionDetection}
      ></moving-object>

      <slot></slot>
    `;
  }

  private readonly onAnimationFrame = (timeMs: number): void => {
    const deltaSeconds =
      this.lastTimeMs === null ? 0 : (timeMs - this.lastTimeMs) / 1000;

    this.lastTimeMs = timeMs;

    this.getMovingObject()?.updateMovement(deltaSeconds);
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

  private getMovingObject(): MovingObject | null {
    const element = this.renderRoot.querySelector("moving-object");

    if (element instanceof MovingObject) {
      return element;
    }

    return null;
  }

  private getGravityFallingObjects(): readonly GravityFalling[] {
    return Array.from(this.querySelectorAll("gravity-falling")).filter(
      (element): element is GravityFalling => element instanceof GravityFalling,
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "waterfall-component": Waterfall;
  }
}
