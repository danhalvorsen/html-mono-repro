import { css, html, LitElement, nothing, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { BaseGameObjectShapeTemplate } from "./BaseGameObjectShapeTemplate.js";
import { ParticleGameObject } from "./ParticleGameObject.js";
import { ParticleGameObjectEventName } from "./ParticleGameObjectEvents.js";

import "./EmitterHeadIcon.js";
import "./ParticleGameObject.js";

interface TimerTarget {
  onTimer(timeMs: number): void;
}

type DirectionVector = Readonly<{
  readonly x: number;
  readonly y: number;
}>;

type ParticleEntry = Readonly<{
  readonly id: number;
  readonly particle: ParticleGameObject;
  readonly startX: number;
  readonly startY: number;
  readonly v0: number;
  readonly angle: number;
  readonly g: number;
}>;

@customElement("particle-game-object-emitter")
export class ParticleGameObjectEmitter extends LitElement {
  public static override styles = css`
    :host {
      display: block;
      position: relative;
      width: 100%;
      height: var(--particle-emitter-height, 300px);
      overflow: hidden;
      contain: layout paint;
      pointer-events: none;
    }

    projectile-animation {
      position: absolute;
      inset: 0;
      display: block;
      width: 0;
      height: 0;
      pointer-events: none;
    }

    particle-game-object {
      position: absolute;
      left: 0;
      top: 0;
      display: block;
      width: 0;
      height: 0;
      pointer-events: none;
    }
  `;

  @property({ type: Number })
  public startX = 0;

  @property({ type: Number })
  public startY = 0;

  @property({ type: Number })
  public v0 = 120;

  @property({ type: Number })
  public angle = 55;

  @property({ type: Number })
  public directionVarianceDegrees = 25;

  @property({ type: Number })
  public speedVariance = 0;

  @property({ type: Number })
  public g = 9.81;

  @property({ type: Number })
  public lifetimeMin = 1000;

  @property({ type: Number })
  public lifetimeMax = 3000;

  @property({ type: Number })
  public particleCount = 1;

  @property({ type: Number })
  public worldHeight = 300;

  @property({ type: Boolean })
  public showEmitterHead = true;

  @property({ type: Number })
  public emitterHeadSize = 18;

  @property({ type: String })
  public emitterHeadFill = "#f59e0b";

  @property({ type: String })
  public emitterHeadStroke = "#111827";

  @property({ attribute: false })
  public shapeTemplate?: BaseGameObjectShapeTemplate;

  @state()
  private particles: readonly ParticleEntry[] = [];

  private nextParticleId = 1;

  public override connectedCallback(): void {
    super.connectedCallback();
    this.applyWorldHeight();
    this.synchronizeParticleCount();
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (changed.has("worldHeight")) {
      this.applyWorldHeight();
    }

    if (changed.has("particleCount")) {
      this.synchronizeParticleCount();
    }
  }

  public emit(count = 1): void {
    const normalizedCount = this.normalizeCount(count);

    if (normalizedCount === 0) {
      return;
    }

    this.particles = Object.freeze([
      ...this.particles,
      ...Array.from({ length: normalizedCount }, () =>
        this.createParticleEntry(),
      ),
    ]);
  }

  public onTimer(timeMs: number): void {
    for (const animation of this.getProjectileAnimations()) {
      animation.onTimer(timeMs);
    }
  }

  protected override render(): TemplateResult {
    return html`
      ${this.renderEmitterHead()}
      ${this.particles.map(
        entry => html`
          <projectile-animation
            .startX=${entry.startX}
            .startY=${entry.startY}
            .v0=${entry.v0}
            .angle=${entry.angle}
            .g=${entry.g}
          >
            ${entry.particle}
          </projectile-animation>
        `,
      )}
    `;
  }

  private renderEmitterHead(): TemplateResult | typeof nothing {
    if (!this.showEmitterHead) {
      return nothing;
    }

    return html`
      <emitter-head-icon
        .x=${this.startX}
        .y=${this.startY}
        .size=${this.emitterHeadSize}
        .fill=${this.emitterHeadFill}
        .stroke=${this.emitterHeadStroke}
      ></emitter-head-icon>
    `;
  }

  private synchronizeParticleCount(): void {
    const targetCount = this.normalizeCount(this.particleCount);
    const currentCount = this.particles.length;

    if (targetCount === currentCount) {
      return;
    }

    if (targetCount < currentCount) {
      this.removeParticlesAfterIndex(targetCount);
      return;
    }

    this.emit(targetCount - currentCount);
  }

  private createParticleEntry(): ParticleEntry {
    const particle = globalThis.document.createElement(
      "particle-game-object",
    ) as ParticleGameObject;

    particle.lifetimeMin = this.lifetimeMin;
    particle.lifetimeMax = this.lifetimeMax;

    if (this.shapeTemplate !== undefined) {
      particle.shapeTemplate = this.shapeTemplate;
    }

    particle.addEventListener(
      ParticleGameObjectEventName.Died,
      this.onParticleDied,
    );

    const direction = this.createDirectionWithVariance(
      this.angle,
      this.directionVarianceDegrees,
    );

    return Object.freeze({
      id: this.nextParticleId++,
      particle,
      startX: this.startX,
      startY: this.startY,
      v0: this.createSpeedWithVariance(this.v0, this.speedVariance),
      angle: this.toDegrees(Math.atan2(direction.y, direction.x)),
      g: this.g,
    });
  }

  private createDirectionWithVariance(
    angleDegrees: number,
    varianceDegrees: number,
  ): DirectionVector {
    const safeVariance = this.normalizeNonNegativeFinite(varianceDegrees);
    const variedAngleDegrees =
      angleDegrees + this.randomBetween(-safeVariance, safeVariance);

    const radians = this.toRadians(variedAngleDegrees);

    return Object.freeze({
      x: Math.cos(radians),
      y: Math.sin(radians),
    });
  }

  private createSpeedWithVariance(speed: number, variance: number): number {
    const safeSpeed = Number.isFinite(speed) ? speed : 0;
    const safeVariance = this.normalizeNonNegativeFinite(variance);

    return Math.max(
      0,
      safeSpeed + this.randomBetween(-safeVariance, safeVariance),
    );
  }

  private readonly onParticleDied = (event: Event): void => {
    const particle = event.target;

    if (!(particle instanceof ParticleGameObject)) {
      return;
    }

    this.removeParticle(particle);
  };

  private removeParticle(particle: ParticleGameObject): void {
    particle.removeEventListener(
      ParticleGameObjectEventName.Died,
      this.onParticleDied,
    );

    const nextParticles = this.particles.filter(
      entry => entry.particle !== particle,
    );

    if (nextParticles.length === this.particles.length) {
      return;
    }

    this.particles = Object.freeze(nextParticles);
  }

  private removeParticlesAfterIndex(index: number): void {
    const removed = this.particles.slice(index);

    for (const entry of removed) {
      entry.particle.removeEventListener(
        ParticleGameObjectEventName.Died,
        this.onParticleDied,
      );

      entry.particle.remove();
    }

    this.particles = Object.freeze(this.particles.slice(0, index));
  }

  private applyWorldHeight(): void {
    this.style.setProperty(
      "--particle-emitter-height",
      `${this.normalizePositiveFinite(this.worldHeight, 300)}px`,
    );
  }

  private normalizeCount(value: number): number {
    if (!Number.isFinite(value)) {
      return 0;
    }

    return Math.max(0, Math.floor(value));
  }

  private normalizeNonNegativeFinite(value: number): number {
    if (!Number.isFinite(value)) {
      return 0;
    }

    return Math.max(0, value);
  }

  private normalizePositiveFinite(value: number, fallback: number): number {
    if (!Number.isFinite(value) || value <= 0) {
      return fallback;
    }

    return value;
  }

  private randomBetween(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  private toDegrees(radians: number): number {
    return (radians * 180) / Math.PI;
  }

  private getProjectileAnimations(): readonly TimerTarget[] {
    return Array.from(
      this.renderRoot.querySelectorAll("projectile-animation"),
    ).filter(this.isTimerTarget);
  }

  private isTimerTarget(value: Element): value is Element & TimerTarget {
    return "onTimer" in value && typeof value.onTimer === "function";
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "particle-game-object-emitter": ParticleGameObjectEmitter;
  }
}