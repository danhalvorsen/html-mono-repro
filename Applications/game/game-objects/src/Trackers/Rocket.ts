import { Vector2 } from "@monorepo/core-math";
import {
  PhysicalObject,
  assertFiniteGreaterThan,
  assertFiniteGreaterThanOrEqual,
  assertFiniteNumber,
  copyVector,
  normalizeVector,
  scaleVector,
} from "./PhysicalObject.js";

export interface RocketStartCommand {
  readonly startPosition: Vector2;
  readonly direction: Vector2;
  readonly initialSpeed: number;
  readonly accelerationMagnitude: number;
  readonly lifetimeSeconds: number;
  readonly startedAt: number;
}

export class Rocket extends PhysicalObject {
  #direction = new Vector2(1, 0);
  #lifetimeSeconds = 0;
  #elapsedLifetimeSeconds = 0;
  #startedAt = 0;
  #active = false;
  #visible = false;

  public get direction(): Vector2 {
    return copyVector(this.#direction);
  }

  public get lifetimeSeconds(): number {
    return this.#lifetimeSeconds;
  }

  public get elapsedLifetimeSeconds(): number {
    return this.#elapsedLifetimeSeconds;
  }

  public get startedAt(): number {
    return this.#startedAt;
  }

  public start(command: RocketStartCommand): void {
    this.validateStartCommand(command);

    const direction = normalizeVector(command.direction);
    const velocity = scaleVector(direction, command.initialSpeed);
    const acceleration = scaleVector(direction, command.accelerationMagnitude);

    this.#direction = direction;
    this.#lifetimeSeconds = command.lifetimeSeconds;
    this.#elapsedLifetimeSeconds = 0;
    this.#startedAt = command.startedAt;
    this.#active = true;
    this.#visible = true;

    this.resetPhysicalState({
      startPosition: command.startPosition,
      velocity,
      acceleration,
    });
  }

  public update(deltaTimeSeconds: number): void {
    assertFiniteGreaterThanOrEqual(deltaTimeSeconds, "deltaTimeSeconds", 0);

    if (!this.#active) {
      return;
    }

    const nextElapsed = this.#elapsedLifetimeSeconds + deltaTimeSeconds;

    if (nextElapsed >= this.#lifetimeSeconds) {
      this.#elapsedLifetimeSeconds = this.#lifetimeSeconds;
      this.#active = false;
      this.#visible = false;
      this.setPositionAt(this.#lifetimeSeconds);
      return;
    }

    this.#elapsedLifetimeSeconds = nextElapsed;
    this.#active = true;
    this.#visible = true;
    this.setPositionAt(this.#elapsedLifetimeSeconds);
  }

  public isActive(): boolean {
    return this.#active;
  }

  public isVisible(): boolean {
    return this.#visible;
  }

  public getVelocityVector(): Vector2 {
    return this.getInitialVelocityVector();
  }

  private validateStartCommand(command: RocketStartCommand): void {
    assertFiniteNumber(command.startedAt, "startedAt");
    assertFiniteGreaterThan(command.lifetimeSeconds, "lifetimeSeconds", 0);
    assertFiniteGreaterThanOrEqual(command.initialSpeed, "initialSpeed", 0);
    assertFiniteGreaterThanOrEqual(
      command.accelerationMagnitude,
      "accelerationMagnitude",
      0,
    );
  }
}