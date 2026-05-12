import { Vector2 } from "@monorepo/core-math";
import { type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { BaseGameObject } from "../BaseGameObject.js";
import { SvgEllipseTemplate } from "../SvgEllipseTemplate.js";

export interface Vector2Like {
  readonly x: number;
  readonly y: number;
}

export interface PhysicalObjectState {
  readonly startPosition: Vector2Like;
  readonly velocity: Vector2Like;
  readonly acceleration: Vector2Like;
}

export interface RocketStartCommand {
  readonly startPosition: Vector2Like;
  readonly direction: Vector2Like;
  readonly initialSpeed: number;
  readonly accelerationMagnitude: number;
  readonly lifetimeSeconds: number;
  readonly startedAt: number;
}

type RocketLifecycleState = {
  elapsedSeconds: number;
  lifetimeSeconds: number;
  startedAt: number;
  active: boolean;
  visible: boolean;
};

@customElement("tracker-rocket-game-object")
export class Rocket extends BaseGameObject {
  #startPosition = new Vector2(0, 0);
  #position = new Vector2(0, 0);
  #velocity = new Vector2(0, 0);
  #acceleration = new Vector2(0, 0);
  #direction = new Vector2(1, 0);
  #lifecycle: RocketLifecycleState = {
    elapsedSeconds: 0,
    lifetimeSeconds: 0,
    startedAt: 0,
    active: false,
    visible: false,
  };

  public constructor() {
    super();
    this.size = 18;
    this.fill = "#f59e0b";
    this.stroke = "#92400e";
  }

  public get direction(): Vector2 {
    return copyVector(this.#direction);
  }

  public get elapsedLifetimeSeconds(): number {
    return this.#lifecycle.elapsedSeconds;
  }

  public get lifetimeSeconds(): number {
    return this.#lifecycle.lifetimeSeconds;
  }

  public get startedAt(): number {
    return this.#lifecycle.startedAt;
  }

  public start(command: RocketStartCommand): void {
    validateStartCommand(command);

    const direction = normalizeVector(command.direction);

    this.#direction = direction;
    this.#lifecycle = {
      elapsedSeconds: 0,
      lifetimeSeconds: command.lifetimeSeconds,
      startedAt: command.startedAt,
      active: true,
      visible: true,
    };

    this.resetPhysicalState({
      startPosition: command.startPosition,
      velocity: scaleVector(direction, command.initialSpeed),
      acceleration: scaleVector(direction, command.accelerationMagnitude),
    });
  }

  public advance(deltaTimeSeconds: number): void {
    assertFiniteGreaterThanOrEqual(deltaTimeSeconds, "deltaTimeSeconds", 0);

    if (!this.#lifecycle.active) {
      return;
    }

    const elapsed = Math.min(
      this.#lifecycle.lifetimeSeconds,
      this.#lifecycle.elapsedSeconds + deltaTimeSeconds,
    );
    this.#lifecycle.elapsedSeconds = elapsed;
    this.setPositionAt(elapsed);

    if (elapsed >= this.#lifecycle.lifetimeSeconds) {
      this.#lifecycle.active = false;
      this.#lifecycle.visible = false;
      return;
    }
  }

  public isActive(): boolean {
    return this.#lifecycle.active;
  }

  public isVisible(): boolean {
    return this.#lifecycle.visible;
  }

  public getVelocityVector(): Vector2 {
    return this.getInitialVelocityVector();
  }

  public getPosition(): Vector2 {
    return copyVector(this.#position);
  }

  protected override willUpdate(): void {
    const radiusX = Math.max(1, this.size / 2);
    const radiusY = Math.max(1, this.size / 4);

    this.shapeTemplate = new SvgEllipseTemplate({
      width: this.size,
      height: this.size,
      radiusX,
      radiusY,
      fill: this.fill,
      stroke: this.stroke,
      strokeWidth: 1.5,
    });
  }

  protected override render(): TemplateResult {
    return super.render();
  }

  private getInitialVelocityVector(): Vector2 {
    return copyVector(this.#velocity);
  }

  private resetPhysicalState(state: PhysicalObjectState): void {
    this.#startPosition = copyVector(state.startPosition);
    this.#position = copyVector(state.startPosition);
    this.#velocity = copyVector(state.velocity);
    this.#acceleration = copyVector(state.acceleration);
    this.setPosistion(this.#position);
  }

  private setPositionAt(elapsedSeconds: number): void {
    assertFiniteGreaterThanOrEqual(elapsedSeconds, "elapsedSeconds", 0);

    this.#position = new Vector2(
      this.#startPosition.x +
        this.#velocity.x * elapsedSeconds +
        0.5 * this.#acceleration.x * elapsedSeconds * elapsedSeconds,
      this.#startPosition.y +
        this.#velocity.y * elapsedSeconds +
        0.5 * this.#acceleration.y * elapsedSeconds * elapsedSeconds,
    );
    this.setPosistion(this.#position);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "tracker-rocket-game-object": Rocket;
  }
}

function validateStartCommand(command: RocketStartCommand): void {
  assertFiniteNumber(command.startedAt, "startedAt");
  assertFiniteGreaterThan(command.lifetimeSeconds, "lifetimeSeconds", 0);
  assertFiniteGreaterThanOrEqual(command.initialSpeed, "initialSpeed", 0);
  assertFiniteGreaterThanOrEqual(
    command.accelerationMagnitude,
    "accelerationMagnitude",
    0,
  );
}

export function copyVector(vector: Vector2Like): Vector2 {
  return new Vector2(vector.x, vector.y);
}

export function subtractVector(left: Vector2Like, right: Vector2Like): Vector2 {
  return new Vector2(left.x - right.x, left.y - right.y);
}

export function scaleVector(vector: Vector2Like, factor: number): Vector2 {
  assertFiniteNumber(factor, "factor");

  return new Vector2(vector.x * factor, vector.y * factor);
}

export function normalizeVector(vector: Vector2Like): Vector2 {
  const length = Math.hypot(vector.x, vector.y);

  if (length === 0) {
    throw new RangeError("vector must not be zero length.");
  }

  return new Vector2(vector.x / length, vector.y / length);
}

export function distanceBetween(left: Vector2Like, right: Vector2Like): number {
  return Math.hypot(left.x - right.x, left.y - right.y);
}

export function assertFiniteNumber(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${name} must be finite.`);
  }
}

export function assertFiniteGreaterThan(value: number, name: string, minExclusive: number): void {
  if (!Number.isFinite(value) || value <= minExclusive) {
    throw new RangeError(`${name} must be greater than ${minExclusive}.`);
  }
}

export function assertFiniteGreaterThanOrEqual(
  value: number,
  name: string,
  minInclusive: number,
): void {
  if (!Number.isFinite(value) || value < minInclusive) {
    throw new RangeError(`${name} must be greater than or equal to ${minInclusive}.`);
  }
}
