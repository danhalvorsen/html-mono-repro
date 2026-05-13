import { Vector2 } from "@monorepo/core-math";
import { html, LitElement, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

import { CollisionObject } from "./CollisionObject.ts";

export class DirectionalMovementPlan {
  public readonly direction: Vector2;
  public readonly initialSpeedPixelsPerSecond: number;
  public readonly accelerationPixelsPerSecondSquared: number;

  public constructor(
    direction: Vector2 = new Vector2(0, 1),
    initialSpeedPixelsPerSecond: number = 0,
    accelerationPixelsPerSecondSquared: number = 320,
  ) {
    this.direction = DirectionalMovementPlan.normalize(direction);
    this.initialSpeedPixelsPerSecond = initialSpeedPixelsPerSecond;
    this.accelerationPixelsPerSecondSquared =
      accelerationPixelsPerSecondSquared;
  }

  public createInitialVelocity(): Vector2 {
    return new Vector2(
      this.direction.x * this.initialSpeedPixelsPerSecond,
      this.direction.y * this.initialSpeedPixelsPerSecond,
    );
  }

  public createAcceleration(): Vector2 {
    return new Vector2(
      this.direction.x * this.accelerationPixelsPerSecondSquared,
      this.direction.y * this.accelerationPixelsPerSecondSquared,
    );
  }

  private static normalize(vector: Vector2): Vector2 {
    const length = Math.hypot(vector.x, vector.y);

    if (length === 0) {
      return new Vector2(0, 1);
    }

    return new Vector2(vector.x / length, vector.y / length);
  }
}

@customElement("gravity-falling")
export class GravityFalling extends LitElement {
  @property({ attribute: false })
  public container: CollisionObject = new CollisionObject(
    new Vector2(10, 10),
    new Vector2(200, 500),
  );

  @property({ attribute: false })
  public movementPlan: DirectionalMovementPlan =
    new DirectionalMovementPlan();

  private readonly size: Vector2 = new Vector2(16, 36);
  private readonly inset: number = 4;

  private position: Vector2 = new Vector2(10, 10);
  private velocity: Vector2 = new Vector2(0, 0);
  private acceleration: Vector2 = new Vector2(0, 320);
  private direction: Vector2 = new Vector2(0, 1);
  private isStarted: boolean = false;
  private isCompleted: boolean = false;

  public override connectedCallback(): void {
    super.connectedCallback();

    this.style.position = "absolute";
    this.style.left = "0";
    this.style.top = "0";
    this.style.pointerEvents = "none";

    this.start();
  }

  public get completed(): boolean {
    return this.isCompleted;
  }

  public updateMovement(deltaSeconds: number): void {
    if (this.isCompleted) {
      return;
    }

    if (!this.isStarted) {
      this.start();
    }

    const safeDeltaSeconds = Math.max(0, deltaSeconds);

    this.position = this.calculateNextPosition(safeDeltaSeconds);
    this.velocity = this.calculateNextVelocity(safeDeltaSeconds);
    this.direction = this.calculateDirection(this.velocity);

    if (this.hasReachedBottom()) {
      this.position = new Vector2(
        this.position.x,
        this.container.bottom - this.size.y,
      );

      this.isCompleted = true;
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
          fill="#60a5fa"
          stroke="#1d4ed8"
          stroke-width="4"
        ></rect>
      </svg>
    `;
  }

  private start(): void {
    this.direction = this.movementPlan.direction;
    this.velocity = this.movementPlan.createInitialVelocity();
    this.acceleration = this.movementPlan.createAcceleration();
    this.position = this.createStartPosition();
    this.isStarted = true;
    this.isCompleted = false;
  }

  private createStartPosition(): Vector2 {
    return new Vector2(
      this.container.left +
        this.inset +
        1 *
          Math.max(0, this.container.size.x - this.size.x - this.inset * 2),
      this.container.top + this.inset,
    );
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

  private calculateDirection(velocity: Vector2): Vector2 {
    const length = Math.hypot(velocity.x, velocity.y);

    if (length === 0) {
      return this.movementPlan.direction;
    }

    return new Vector2(velocity.x / length, velocity.y / length);
  }

  private hasReachedBottom(): boolean {
    return this.position.y + this.size.y >= this.container.bottom;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "gravity-falling": GravityFalling;
  }
}
