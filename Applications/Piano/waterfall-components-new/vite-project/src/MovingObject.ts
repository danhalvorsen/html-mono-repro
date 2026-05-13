import { Vector2 } from "@monorepo/core-math";
import { html, LitElement, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

import type { CollisionDetection } from "./CollisionDetection.ts";
import { CollisionObject } from "./CollisionObject.ts";

@customElement("moving-object")
export class MovingObject extends LitElement {
  @property({ attribute: false })
  public container: CollisionObject = new CollisionObject(
    new Vector2(10, 10),
    new Vector2(200, 500),
  );

  @property({ attribute: false })
  public collisionDetection!: CollisionDetection;

  private readonly size: Vector2 = new Vector2(20, 50);

  private position: Vector2 = new Vector2(18, 18);
  private direction: Vector2 = this.normalizeVector(new Vector2(1, 1));
  private velocity: Vector2 = new Vector2(180, 140);
  private acceleration: Vector2 = new Vector2(0, 0);

  public override connectedCallback(): void {
    super.connectedCallback();

    this.style.position = "absolute";
    this.style.left = "0";
    this.style.top = "0";
    this.style.pointerEvents = "none";
  }

  public updateMovement(deltaSeconds: number): void {
    const safeDeltaSeconds = Math.max(0, deltaSeconds);

    this.direction = this.calculateDirection(this.velocity, this.direction);
    this.position = this.calculateNextPosition(safeDeltaSeconds);
    this.velocity = this.calculateNextVelocity(safeDeltaSeconds);

    const collision = this.collisionDetection.detectInside(
      new CollisionObject(this.position, this.size),
      this.container,
    );

    this.position = collision.correctedPosition;

    if (collision.hitHorizontalEdge) {
      this.direction = new Vector2(-this.direction.x, this.direction.y);
      this.velocity = new Vector2(-this.velocity.x, this.velocity.y);
    }

    if (collision.hitVerticalEdge) {
      this.direction = new Vector2(this.direction.x, -this.direction.y);
      this.velocity = new Vector2(this.velocity.x, -this.velocity.y);
    }

    this.requestUpdate();
  }

  protected override render(): TemplateResult {
    const svgWidth = this.container.right + 20;
    const svgHeight = this.container.bottom + 20;

    return html`
      <svg
        width=${svgWidth}
        height=${svgHeight}
        viewBox="0 0 ${svgWidth} ${svgHeight}"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x=${this.position.x}
          y=${this.position.y}
          width=${this.size.x}
          height=${this.size.y}
          fill="orange"
          stroke="red"
          stroke-width="4"
        ></rect>
      </svg>
    `;
  }

  private calculateNextPosition(deltaSeconds: number): Vector2 {
    return new Vector2(
      this.position.x +
        this.velocity.x * deltaSeconds +
        0.5 * this.acceleration.x * deltaSeconds * deltaSeconds,
      this.position.y +
        this.velocity.y * deltaSeconds +
        0.5 * this.acceleration.y * deltaSeconds * deltaSeconds,
    );
  }

  private calculateNextVelocity(deltaSeconds: number): Vector2 {
    return new Vector2(
      this.velocity.x + this.acceleration.x * deltaSeconds,
      this.velocity.y + this.acceleration.y * deltaSeconds,
    );
  }

  private calculateDirection(
    velocity: Vector2,
    fallbackDirection: Vector2,
  ): Vector2 {
    const length = Math.hypot(velocity.x, velocity.y);

    if (length === 0) {
      return fallbackDirection;
    }

    return new Vector2(velocity.x / length, velocity.y / length);
  }

  private normalizeVector(vector: Vector2): Vector2 {
    const length = Math.hypot(vector.x, vector.y);

    if (length === 0) {
      return new Vector2(1, 0);
    }

    return new Vector2(vector.x / length, vector.y / length);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "moving-object": MovingObject;
  }
}

