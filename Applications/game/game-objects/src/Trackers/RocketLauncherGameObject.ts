import { Vector2 } from "@monorepo/core-math";
import { Rocket } from "./Rocket.js";
import {
  assertFiniteGreaterThan,
  assertFiniteGreaterThanOrEqual,
  copyVector,
  distanceBetween,
  subtractVector,
} from "./PhysicalObject.js";

export interface RocketPositionProvider {
  getPosistion(): Vector2;
}

export interface RocketFactory {
  create(): Rocket;
}

export interface RocketLauncherGameObjectOptions {
  readonly position: Vector2;
  readonly mouseGameObject?: RocketPositionProvider | null;
  readonly detectionRadius: number;
  readonly maxRockets: number;
  readonly cooldownSeconds?: number;
  readonly initialSpeed: number;
  readonly accelerationMagnitude: number;
  readonly lifetimeSeconds: number;
  readonly idleFill?: string;
  readonly idleStroke?: string;
  readonly detectedFill?: string;
  readonly detectedStroke?: string;
  readonly onRocketLaunched?: (rocket: Rocket) => void;
  readonly onDetectionChanged?: (isDetected: boolean) => void;
  readonly onColorChanged?: (fill: string, stroke: string) => void;
}

export class DefaultRocketFactory implements RocketFactory {
  public create(): Rocket {
    return new Rocket();
  }
}

export class RocketLauncherGameObject {
  readonly #rocketFactory: RocketFactory;
  readonly #rockets: Rocket[] = [];

  #position: Vector2;
  #mouseGameObject: RocketPositionProvider | null;
  #lastUpdateTimeSeconds: number | null = null;
  #lastLaunchTimeSeconds: number | null = null;
  #mouseDetectedInsideRadius = false;

  public readonly detectionRadius: number;
  public readonly maxRockets: number;
  public readonly cooldownSeconds: number;
  public readonly initialSpeed: number;
  public readonly accelerationMagnitude: number;
  public readonly lifetimeSeconds: number;

  public readonly idleFill: string;
  public readonly idleStroke: string;
  public readonly detectedFill: string;
  public readonly detectedStroke: string;

  public fill: string;
  public stroke: string;

  public readonly onRocketLaunched: ((rocket: Rocket) => void) | null;
  public readonly onDetectionChanged: ((isDetected: boolean) => void) | null;
  public readonly onColorChanged: ((fill: string, stroke: string) => void) | null;

  public constructor(
    options: RocketLauncherGameObjectOptions,
    rocketFactory: RocketFactory = new DefaultRocketFactory(),
  ) {
    validateOptions(options);

    this.#position = copyVector(options.position);
    this.#mouseGameObject = options.mouseGameObject ?? null;
    this.#rocketFactory = rocketFactory;

    this.detectionRadius = options.detectionRadius;
    this.maxRockets = options.maxRockets;
    this.cooldownSeconds = options.cooldownSeconds ?? 0.5;
    this.initialSpeed = options.initialSpeed;
    this.accelerationMagnitude = options.accelerationMagnitude;
    this.lifetimeSeconds = options.lifetimeSeconds;

    this.idleFill = options.idleFill ?? "#60a5fa";
    this.idleStroke = options.idleStroke ?? "#1d4ed8";

    // Red when MouseGameObject is detected inside detection radius.
    this.detectedFill = options.detectedFill ?? "#ef4444";
    this.detectedStroke = options.detectedStroke ?? "#991b1b";

    this.fill = this.idleFill;
    this.stroke = this.idleStroke;

    this.onRocketLaunched = options.onRocketLaunched ?? null;
    this.onDetectionChanged = options.onDetectionChanged ?? null;
    this.onColorChanged = options.onColorChanged ?? null;
  }

  public get rockets(): readonly Rocket[] {
    return this.#rockets;
  }

  public getPosistion(): Vector2 {
    return copyVector(this.#position);
  }

  public setPosistion(position: Vector2): void {
    this.#position = copyVector(position);
  }

  public setMouseGameObject(mouseGameObject: RocketPositionProvider | null): void {
    this.#mouseGameObject = mouseGameObject;
  }

  public isMouseDetectedInsideRadius(): boolean {
    return this.#mouseDetectedInsideRadius;
  }

  public onTime(timeMs: number): void {
    this.update(timeMs / 1000);
  }

  public update(currentTimeSeconds: number): Rocket | null {
    assertFiniteGreaterThanOrEqual(currentTimeSeconds, "currentTimeSeconds", 0);

    const deltaTimeSeconds = this.resolveDeltaTime(currentTimeSeconds);

    // Existing rockets always continue.
    this.updateRockets(deltaTimeSeconds);

    const detected = this.resolveMouseDetectedInsideRadius();
    this.setMouseDetectedInsideRadius(detected);

    if (!detected) {
      return null;
    }

    if (!this.cooldownElapsed(currentTimeSeconds)) {
      return null;
    }

    // Launches another rocket every cooldown interval.
    // Does not wait for previous rockets to expire.
    return this.launch(currentTimeSeconds);
  }

  private resolveDeltaTime(currentTimeSeconds: number): number {
    const previous = this.#lastUpdateTimeSeconds;
    this.#lastUpdateTimeSeconds = currentTimeSeconds;

    if (previous === null) {
      return 0;
    }

    if (currentTimeSeconds < previous) {
      throw new RangeError("currentTimeSeconds must be monotonic.");
    }

    return currentTimeSeconds - previous;
  }

  private updateRockets(deltaTimeSeconds: number): void {
    for (const rocket of this.#rockets) {
      rocket.update(deltaTimeSeconds);
    }
  }

  private resolveMouseDetectedInsideRadius(): boolean {
    const mousePosition = this.#mouseGameObject?.getPosistion();

    if (mousePosition === undefined) {
      return false;
    }

    return distanceBetween(this.#position, mousePosition) <= this.detectionRadius;
  }

  private setMouseDetectedInsideRadius(detected: boolean): void {
    if (this.#mouseDetectedInsideRadius === detected) {
      return;
    }

    this.#mouseDetectedInsideRadius = detected;

    this.fill = detected ? this.detectedFill : this.idleFill;
    this.stroke = detected ? this.detectedStroke : this.idleStroke;

    this.onDetectionChanged?.(detected);
    this.onColorChanged?.(this.fill, this.stroke);
  }

  private cooldownElapsed(currentTimeSeconds: number): boolean {
    if (this.#lastLaunchTimeSeconds === null) {
      return true;
    }

    return currentTimeSeconds - this.#lastLaunchTimeSeconds >= this.cooldownSeconds;
  }

  private launch(currentTimeSeconds: number): Rocket | null {
    const mousePosition = this.#mouseGameObject?.getPosistion();

    if (mousePosition === undefined) {
      return null;
    }

    const launchPosition = this.getPosistion();
    const direction = subtractVector(mousePosition, launchPosition);

    if (direction.x === 0 && direction.y === 0) {
      return null;
    }

    const rocket = this.resolveRocket();

    rocket.start({
      startPosition: launchPosition,
      direction,
      initialSpeed: this.initialSpeed,
      accelerationMagnitude: this.accelerationMagnitude,
      lifetimeSeconds: this.lifetimeSeconds,
      startedAt: currentTimeSeconds,
    });

    this.#lastLaunchTimeSeconds = currentTimeSeconds;
    this.onRocketLaunched?.(rocket);

    return rocket;
  }

  private resolveRocket(): Rocket {
    const inactiveRocket = this.#rockets.find((rocket) => !rocket.isActive());

    if (inactiveRocket !== undefined) {
      return inactiveRocket;
    }

    if (this.#rockets.length < this.maxRockets) {
      const rocket = this.#rocketFactory.create();
      this.#rockets.push(rocket);
      return rocket;
    }

    return this.getOldestActiveRocket();
  }

  private getOldestActiveRocket(): Rocket {
    const first = this.#rockets[0];

    if (first === undefined) {
      throw new Error("rocket pool is empty.");
    }

    return this.#rockets.reduce((oldest, current) =>
      current.startedAt < oldest.startedAt ? current : oldest,
    );
  }
}

function validateOptions(options: RocketLauncherGameObjectOptions): void {
  assertFiniteGreaterThan(options.detectionRadius, "detectionRadius", 0);
  assertFiniteGreaterThan(options.maxRockets, "maxRockets", 0);
  assertFiniteGreaterThanOrEqual(options.cooldownSeconds ?? 0.5, "cooldownSeconds", 0);
  assertFiniteGreaterThanOrEqual(options.initialSpeed, "initialSpeed", 0);
  assertFiniteGreaterThanOrEqual(
    options.accelerationMagnitude,
    "accelerationMagnitude",
    0,
  );
  assertFiniteGreaterThan(options.lifetimeSeconds, "lifetimeSeconds", 0);

  if (!Number.isInteger(options.maxRockets)) {
    throw new RangeError("maxRockets must be an integer.");
  }
}