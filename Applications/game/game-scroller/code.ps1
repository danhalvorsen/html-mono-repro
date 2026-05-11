Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Run from:
# C:\Users\danha\source\repos\HTML\MonoRepro\Applications\game\game-scroller

$GameObjects = Resolve-Path "..\game-objects"
$Src = Join-Path $GameObjects "src"
$Trackers = Join-Path $Src "Trackers"

New-Item -ItemType Directory -Force -Path $Trackers | Out-Null

function Write-Ts {
    param(
        [string] $Path,
        [string] $Content
    )

    [System.IO.File]::WriteAllText(
        $Path,
        $Content.TrimStart(),
        [System.Text.UTF8Encoding]::new($false)
    )
}

function Add-Export {
    param(
        [string] $Path,
        [string] $Line
    )

    $Content = Get-Content -Raw -Path $Path

    if (-not $Content.Contains($Line)) {
        Add-Content -Path $Path -Value "`n$Line"
    }
}

Write-Ts `
    -Path (Join-Path $Trackers "MousePointerGameObject.ts") `
    -Content @'
import { Vector2 } from "@monorepo/core-math";
import { RectangleGameObject } from "../RectangleGameObjects.js";

export class MousePointerGameObject extends RectangleGameObject {
  public trackWindowPointer = true;

  public constructor() {
    super();

    this.size = 30;
    this.fill = "#f97316";
    this.stroke = "#7c2d12";
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    globalThis.addEventListener("pointermove", this.onPointerMove);
  }

  public override disconnectedCallback(): void {
    globalThis.removeEventListener("pointermove", this.onPointerMove);
    super.disconnectedCallback();
  }

  private readonly onPointerMove = (event: Event): void => {
    if (!this.trackWindowPointer || !(event instanceof PointerEvent)) {
      return;
    }

    this.setPosistion(new Vector2(event.clientX, event.clientY));
  };
}
'@

Write-Ts `
    -Path (Join-Path $Trackers "ScannerGameObject.ts") `
    -Content @'
import { Vector2 } from "@monorepo/core-math";
import { css, html, type CSSResultGroup, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { BaseGameObject } from "../BaseGameObject.js";
import { SvgEllipseTemplate } from "../SvgEllipseTemplate.js";

export interface ScannerTarget {
  getPosistion(): Vector2;
}

type ParticleState = {
  readonly startPosition: Vector2;
  readonly velocity: Vector2;
  readonly acceleration: Vector2;
  elapsedSeconds: number;
  position: Vector2;
  active: boolean;
};

@customElement("scanner-game-object")
export class ScannerGameObject extends BaseGameObject {
  public static override styles: CSSResultGroup = [
    BaseGameObject.styles ?? [],
    css`
      .particle-layer {
        position: absolute;
        inset: 0;
        pointer-events: none;
        overflow: visible;
      }
    `,
  ];

  @property({ attribute: false })
  public mousePointer: ScannerTarget | null = null;

  @property({ type: Number })
  public triggerDistance = 140;

  @property({ type: Number })
  public particleLifeTimeSeconds = 1.8;

  @property({ attribute: false })
  public particleStartVelocity = new Vector2(0, -120);

  @property({ type: Number })
  public particleAccelerationScale = 1;

  #lastTimeMs: number | null = null;
  #particle: ParticleState | null = null;

  public constructor() {
    super();

    this.size = 36;
    this.fill = "#10b981";
    this.stroke = "#064e3b";
  }

  public override onTime(timeMs: number): void {
    const deltaSeconds = this.getDeltaSeconds(timeMs);

    this.updateParticle(deltaSeconds);

    if (this.#particle?.active === true) {
      this.requestUpdate();
      return;
    }

    if (!this.isMouseInsideRange()) {
      this.requestUpdate();
      return;
    }

    this.launchParticle();
    this.requestUpdate();
  }

  protected override willUpdate(): void {
    this.shapeTemplate = new SvgEllipseTemplate({
      width: this.size,
      height: this.size,
      radiusX: this.size / 2,
      radiusY: this.size / 2,
      fill: this.fill,
      stroke: this.stroke,
      strokeWidth: 2,
    });
  }

  protected override render(): TemplateResult {
    return html`
      ${super.render()}
      ${this.renderParticle()}
    `;
  }

  private getDeltaSeconds(timeMs: number): number {
    const previous = this.#lastTimeMs;
    this.#lastTimeMs = timeMs;

    if (previous === null) {
      return 0;
    }

    return Math.max(0, timeMs - previous) / 1000;
  }

  private isMouseInsideRange(): boolean {
    const mousePosition = this.mousePointer?.getPosistion();

    if (mousePosition === undefined) {
      return false;
    }

    return distance(this.getPosistion(), mousePosition) <= this.triggerDistance;
  }

  private launchParticle(): void {
    const mousePosition = this.mousePointer?.getPosistion();

    if (mousePosition === undefined) {
      return;
    }

    const startPosition = this.getPosistion();
    const direction = normalize(subtract(mousePosition, startPosition));
    const speed = Math.max(1, length(this.particleStartVelocity));

    const velocity = scale(direction, speed);
    const acceleration = scale(direction, speed * this.particleAccelerationScale);

    this.#particle = {
      startPosition,
      velocity,
      acceleration,
      elapsedSeconds: 0,
      position: startPosition,
      active: true,
    };
  }

  private updateParticle(deltaSeconds: number): void {
    const particle = this.#particle;

    if (particle === null || !particle.active) {
      return;
    }

    const elapsedSeconds = particle.elapsedSeconds + deltaSeconds;

    if (elapsedSeconds >= this.particleLifeTimeSeconds) {
      particle.elapsedSeconds = this.particleLifeTimeSeconds;
      particle.position = this.getParticlePosition(particle, this.particleLifeTimeSeconds);
      particle.active = false;
      return;
    }

    particle.elapsedSeconds = elapsedSeconds;
    particle.position = this.getParticlePosition(particle, elapsedSeconds);
  }

  private getParticlePosition(particle: ParticleState, elapsedSeconds: number): Vector2 {
    return new Vector2(
      particle.startPosition.x +
        particle.velocity.x * elapsedSeconds +
        0.5 * particle.acceleration.x * elapsedSeconds * elapsedSeconds,
      particle.startPosition.y +
        particle.velocity.y * elapsedSeconds +
        0.5 * particle.acceleration.y * elapsedSeconds * elapsedSeconds,
    );
  }

  private renderParticle(): TemplateResult | null {
    const particle = this.#particle;

    if (particle === null || !particle.active) {
      return null;
    }

    return html`
      <svg
        class="particle-layer"
        width=${this.options.width}
        height=${this.options.height}
        viewBox=${`0 0 ${this.options.width} ${this.options.height}`}
        aria-hidden="true"
      >
        <ellipse
          cx=${particle.position.x}
          cy=${particle.position.y}
          rx=${Math.max(4, this.size / 5)}
          ry=${Math.max(4, this.size / 5)}
          fill="#f59e0b"
          stroke="#92400e"
          stroke-width="2"
        ></ellipse>
      </svg>
    `;
  }
}

function subtract(left: Vector2, right: Vector2): Vector2 {
  return new Vector2(left.x - right.x, left.y - right.y);
}

function scale(vector: Vector2, factor: number): Vector2 {
  return new Vector2(vector.x * factor, vector.y * factor);
}

function length(vector: Vector2): number {
  return Math.hypot(vector.x, vector.y);
}

function distance(left: Vector2, right: Vector2): number {
  return length(subtract(left, right));
}

function normalize(vector: Vector2): Vector2 {
  const vectorLength = length(vector);

  if (vectorLength === 0) {
    return new Vector2(0, -1);
  }

  return new Vector2(vector.x / vectorLength, vector.y / vectorLength);
}

declare global {
  interface HTMLElementTagNameMap {
    "scanner-game-object": ScannerGameObject;
  }
}
'@

Write-Ts `
    -Path (Join-Path $Trackers "createMouseTrackingScanner.ts") `
    -Content @'
import { Vector2 } from "@monorepo/core-math";
import "./ScannerGameObject.js";
import { ScannerGameObject, type ScannerTarget } from "./ScannerGameObject.js";

export interface CreateMouseTrackingScannerOptions {
  readonly mousePointer: ScannerTarget;
  readonly triggerDistance: number;
  readonly particleLifeTimeSeconds: number;
  readonly particleStartVelocity: Vector2;
  readonly particleAccelerationScale: number;
}

export function createMouseTrackingScanner(
  options: CreateMouseTrackingScannerOptions,
): ScannerGameObject {
  const scanner = document.createElement("scanner-game-object");

  scanner.mousePointer = options.mousePointer;
  scanner.triggerDistance = options.triggerDistance;
  scanner.particleLifeTimeSeconds = options.particleLifeTimeSeconds;
  scanner.particleStartVelocity = options.particleStartVelocity;
  scanner.particleAccelerationScale = options.particleAccelerationScale;

  return scanner;
}
'@

Write-Ts `
    -Path (Join-Path $Trackers "index.ts") `
    -Content @'
export { MousePointerGameObject } from "./MousePointerGameObject.js";
export { ScannerGameObject } from "./ScannerGameObject.js";
export { createMouseTrackingScanner } from "./createMouseTrackingScanner.js";

export type { ScannerTarget } from "./ScannerGameObject.js";
export type { CreateMouseTrackingScannerOptions } from "./createMouseTrackingScanner.js";
'@

$Index = Join-Path $Src "index.ts"

Add-Export -Path $Index -Line 'export { MousePointerGameObject } from "./Trackers/MousePointerGameObject.js";'
Add-Export -Path $Index -Line 'export { ScannerGameObject } from "./Trackers/ScannerGameObject.js";'
Add-Export -Path $Index -Line 'export { createMouseTrackingScanner } from "./Trackers/createMouseTrackingScanner.js";'
Add-Export -Path $Index -Line 'export type { ScannerTarget } from "./Trackers/ScannerGameObject.js";'
Add-Export -Path $Index -Line 'export type { CreateMouseTrackingScannerOptions } from "./Trackers/createMouseTrackingScanner.js";'

pnpm build