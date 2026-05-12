import { customElement, property } from "lit/decorators.js";
import { BaseGameObject } from "./BaseGameObject.js";
import { createParticleGameObjectDiedEvent } from "./ParticleGameObjectEvents.js";

/**
 * Game object with finite random lifetime in milliseconds.
 *
 * Movement is owned by projectile-animation.
 * This class owns lifetime and rendering state only.
 */
@customElement("particle-game-object")
export class ParticleGameObject extends BaseGameObject {
  @property({ type: Number })
  public lifetimeMin = 1000;

  @property({ type: Number })
  public lifetimeMax = 3000;

  @property({ type: Boolean, reflect: true })
  public isAlive = true;

  private deathTimer: ReturnType<typeof globalThis.setTimeout> | null = null;

  public override connectedCallback(): void {
    super.connectedCallback();
    this.startLifetime();
  }

  public override disconnectedCallback(): void {
    this.clearLifetimeTimer();
    super.disconnectedCallback();
  }

  public kill(): void {
    if (!this.isAlive) {
      return;
    }

    this.isAlive = false;
    this.dispatchEvent(createParticleGameObjectDiedEvent(this));
    this.remove();
  }

  private startLifetime(): void {
    this.clearLifetimeTimer();
    this.isAlive = true;

    this.deathTimer = globalThis.setTimeout(() => {
      this.deathTimer = null;
      this.kill();
    }, this.resolveRandomLifetimeMs());
  }

  private clearLifetimeTimer(): void {
    if (this.deathTimer === null) {
      return;
    }

    globalThis.clearTimeout(this.deathTimer);
    this.deathTimer = null;
  }

  private resolveRandomLifetimeMs(): number {
    const min = Number.isFinite(this.lifetimeMin)
      ? Math.max(0, this.lifetimeMin)
      : 0;

    const max = Number.isFinite(this.lifetimeMax)
      ? Math.max(min, this.lifetimeMax)
      : min;

    return min + Math.random() * (max - min);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "particle-game-object": ParticleGameObject;
  }
}