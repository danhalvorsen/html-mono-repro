import { Vector2 } from "@monorepo/core-math";
import { css, html, type CSSResultGroup, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { BaseGameObjectSlots } from "../BaseGameObjectSlots.js";
import { RectangleGameObject } from "../RectangleGameObjects.js";
import {
  assertFiniteGreaterThan,
  assertFiniteGreaterThanOrEqual,
  Rocket,
} from "./Rocket.js";

export interface MouseGameObject {
  getPosistion(): Vector2;
  isDetected?(): boolean;
  detected?: boolean;
}

export type RocketPositionProvider = MouseGameObject;

@customElement("rocket-launcher-game-object")
export class RocketLauncherGameObject extends RectangleGameObject {
  public static override styles: CSSResultGroup = [
    RectangleGameObject.styles ?? [],
    css`
      :host {
        display: block;
        position: relative;
        pointer-events: none;
      }
    `,
  ];

  readonly #rockets: Rocket[] = [];
  readonly #rocketIds = new WeakMap<Rocket, number>();
  #nextRocketId = 1;
  #lastUpdateTimeMs: number | null = null;
  #nextAllowedLaunchTimeMs = 0;
  #lastObservedMousePosition: Vector2 | null = null;
  #mouseMovedSinceLastLaunch = true;
  #mouseDetectedInsideRadius = false;
  #originalFill: string | null = null;
  #originalStroke: string | null = null;
  #lastAimDirection = new Vector2(0, -1);

  @property({ attribute: false })
  public mouseGameObject: MouseGameObject | null = null;

  @property({ type: Number })
  public detectionRadius = 140;

  @property({ type: Number })
  public launchIntervalMs = 1000;

  @property({ type: Number })
  public maxRockets = 1000;

  @property({ type: Number })
  public initialSpeed = 180;

  @property({ type: Number })
  public accelerationMagnitude = 80;

  @property({ type: Number })
  public lifetimeSeconds = 3;

  @property({ type: String })
  public detectedFill = "#ef4444";

  @property({ type: String })
  public detectedStroke = "#991b1b";

  @property({ type: Number })
  public rocketLength = 18;

  @property({ type: Number })
  public rocketWidth = 7;

  public constructor() {
    super();
    this.size = 36;
    this.fill = "#10b981";
    this.stroke = "#064e3b";
  }

  public get rockets(): readonly Rocket[] {
    return this.#rockets;
  }

  public isMouseDetectedInsideRadius(): boolean {
    return this.#mouseDetectedInsideRadius;
  }

  public override onTime(timeMs: number): void {
    this.updateSimulation(timeMs);
  }

  public updateSimulation(currentTimeMs: number): Rocket | null {
    validateLauncherState(this);
    assertFiniteGreaterThanOrEqual(currentTimeMs, "currentTimeMs", 0);

    const deltaSeconds = this.resolveDeltaSeconds(currentTimeMs);
    for (const rocket of this.#rockets) {
      rocket.advance(deltaSeconds);
    }
    this.updateMouseMovementFlag();

    const detectedInsideRadius = this.resolveMouseDetectedInsideRadius();
    this.setMouseDetectedInsideRadius(detectedInsideRadius);

    let launched: Rocket | null = null;
    if (
      detectedInsideRadius &&
      this.canLaunchAt(currentTimeMs) &&
      this.#mouseMovedSinceLastLaunch
    ) {
      launched = this.launchRocket(currentTimeMs);
    }

    this.syncRocketPresentation();

    // Always update the launcher/rocket view even when detection is false.
    this.requestUpdate();
    return launched;
  }

  private resolveDeltaSeconds(currentTimeMs: number): number {
    const previous = this.#lastUpdateTimeMs;
    this.#lastUpdateTimeMs = currentTimeMs;

    if (previous === null) {
      return 0;
    }

    if (currentTimeMs < previous) {
      throw new RangeError("currentTimeMs must be monotonic.");
    }

    return (currentTimeMs - previous) / 1000;
  }

  private resolveMouseDetectedInsideRadius(): boolean {
    const mouse = this.mouseGameObject;
    if (mouse === null || !this.isMouseDetected(mouse)) {
      return false;
    }

    return distanceBetween(this.getPosistion(), mouse.getPosistion()) <= this.detectionRadius;
  }

  private isMouseDetected(mouse: MouseGameObject): boolean {
    if (typeof mouse.isDetected === "function") {
      return mouse.isDetected();
    }

    if (typeof mouse.detected === "boolean") {
      return mouse.detected;
    }

    return true;
  }

  private setMouseDetectedInsideRadius(detectedInsideRadius: boolean): void {
    if (this.#originalFill === null) {
      this.#originalFill = this.fill;
    }

    if (this.#originalStroke === null) {
      this.#originalStroke = this.stroke;
    }

    if (this.#mouseDetectedInsideRadius === detectedInsideRadius) {
      return;
    }

    this.#mouseDetectedInsideRadius = detectedInsideRadius;

    if (detectedInsideRadius) {
      this.fill = this.detectedFill;
      this.stroke = this.detectedStroke;
      return;
    }

    this.fill = this.#originalFill ?? this.fill;
    this.stroke = this.#originalStroke ?? this.stroke;
  }

  private canLaunchAt(currentTimeMs: number): boolean {
    return currentTimeMs >= this.#nextAllowedLaunchTimeMs;
  }

  private launchRocket(currentTimeMs: number): Rocket | null {
    const mousePosition = this.mouseGameObject?.getPosistion();
    if (mousePosition === undefined) {
      return null;
    }

    const launcherPosition = this.getPosistion();
    const directionToMouse = subtractVector(mousePosition, launcherPosition);
    const direction = isZeroVector(directionToMouse)
      ? this.#lastAimDirection
      : directionToMouse;

    if (!isZeroVector(directionToMouse)) {
      this.#lastAimDirection = directionToMouse;
    }

    const rocket = this.resolveRocket();
    // Rockets are slotted children of the launcher, so they render in launcher-local coordinates.
    // Local origin (0,0) corresponds to the launcher center after parent transform is applied.
    const localStartPosition = new Vector2(0, 0);
    rocket.start({
      startPosition: localStartPosition,
      direction,
      initialSpeed: this.initialSpeed,
      accelerationMagnitude: this.accelerationMagnitude,
      lifetimeSeconds: this.lifetimeSeconds,
      startedAt: currentTimeMs / 1000,
    });

    this.#nextAllowedLaunchTimeMs = currentTimeMs + this.launchIntervalMs;
    this.#mouseMovedSinceLastLaunch = false;
    return rocket;
  }

  private updateMouseMovementFlag(): void {
    const mousePosition = this.mouseGameObject?.getPosistion();
    if (mousePosition === undefined) {
      return;
    }

    const last = this.#lastObservedMousePosition;
    if (last === null) {
      this.#lastObservedMousePosition = new Vector2(mousePosition.x, mousePosition.y);
      return;
    }

    if (mousePosition.x !== last.x || mousePosition.y !== last.y) {
      this.#mouseMovedSinceLastLaunch = true;
      this.#lastObservedMousePosition = new Vector2(mousePosition.x, mousePosition.y);
    }
  }

  private resolveRocket(): Rocket {
    if (this.#rockets.length < this.maxRockets) {
      const created = new Rocket();
      this.#rocketIds.set(created, this.#nextRocketId);
      this.#nextRocketId += 1;
      created.slot = BaseGameObjectSlots.Children;
      this.appendChild(created);
      this.#rockets.push(created);
      return created;
    }

    const inactive = this.#rockets.find((rocket) => !rocket.isActive());
    if (inactive !== undefined) {
      return inactive;
    }

    const first = this.#rockets[0];
    if (first === undefined) {
      throw new Error("rocket pool is empty.");
    }

    return this.#rockets.reduce((oldest, current) =>
      current.startedAt < oldest.startedAt ? current : oldest,
    );
  }

  private getRocketId(rocket: Rocket): number {
    const existing = this.#rocketIds.get(rocket);
    if (existing !== undefined) {
      return existing;
    }

    const assigned = this.#nextRocketId;
    this.#rocketIds.set(rocket, assigned);
    this.#nextRocketId += 1;
    return assigned;
  }

  private syncRocketPresentation(): void {
    const width =
      Number.isFinite(this.options.width) && this.options.width > 0
        ? this.options.width
        : Math.max(1, this.clientWidth);
    const height =
      Number.isFinite(this.options.height) && this.options.height > 0
        ? this.options.height
        : Math.max(1, this.clientHeight);

    for (const rocket of this.#rockets) {
      if (rocket.slot !== BaseGameObjectSlots.Children) {
        rocket.slot = BaseGameObjectSlots.Children;
      }

      if (rocket.parentElement !== this) {
        this.appendChild(rocket);
      }

      rocket.options = {
        width,
        height,
        rotationRadians: 0,
      };
      rocket.hidden = !rocket.isVisible();
    }
  }

  protected override render(): TemplateResult {
    return html`${super.render()}`;
  }
}

function validateLauncherState(launcher: RocketLauncherGameObject): void {
  assertFiniteGreaterThan(launcher.detectionRadius, "detectionRadius", 0);
  assertFiniteGreaterThan(launcher.launchIntervalMs, "launchIntervalMs", 0);
  assertFiniteGreaterThan(launcher.maxRockets, "maxRockets", 0);
  assertFiniteGreaterThan(launcher.lifetimeSeconds, "lifetimeSeconds", 0);
  assertFiniteGreaterThanOrEqual(launcher.initialSpeed, "initialSpeed", 0);
  assertFiniteGreaterThanOrEqual(
    launcher.accelerationMagnitude,
    "accelerationMagnitude",
    0,
  );

  if (!Number.isInteger(launcher.maxRockets)) {
    throw new RangeError("maxRockets must be an integer.");
  }
}

function isZeroVector(vector: Vector2): boolean {
  return vector.x === 0 && vector.y === 0;
}

function subtractVector(left: Vector2, right: Vector2): Vector2 {
  return new Vector2(left.x - right.x, left.y - right.y);
}

function distanceBetween(left: Vector2, right: Vector2): number {
  const dx = left.x - right.x;
  const dy = left.y - right.y;
  return Math.sqrt(dx * dx + dy * dy);
}

declare global {
  interface HTMLElementTagNameMap {
    "rocket-launcher-game-object": RocketLauncherGameObject;
  }
}
