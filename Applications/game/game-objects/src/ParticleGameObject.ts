import { customElement, property } from "lit/decorators.js";
import { BaseGameObject } from "./BaseGameObject.js";

/**
 * Game object with finite random lifetime in milliseconds.
 */
@customElement("particle-game-object")
export class ParticleGameObject extends BaseGameObject {
  @property({ type: Number })
  public lifetimeMin = 1000;

  @property({ type: Number })
  public lifetimeMax = 3000;

  @property({ type: Boolean, reflect: true })
  public isAlive = true;

  private deathTimer: number | null = null;

  public override connectedCallback(): void {
    super.connectedCallback();
    this.startLifetime();
  }

  public override disconnectedCallback(): void {
    this.clearLifetimeTimer();
    super.disconnectedCallback();
  }

  private startLifetime(): void {
    this.clearLifetimeTimer();
    this.isAlive = true;

    const lifetimeMs = this.resolveRandomLifetimeMs();
    this.deathTimer = globalThis.setTimeout(() => {
      this.isAlive = false;
      this.deathTimer = null;
      this.remove();
    }, lifetimeMs);
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
