import { Vector2 } from "@monorepo/core-math";
import { html, LitElement, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

import { CollisionObject } from "../collision/CollisionObject.ts";
import { GravityFallingMovementStrategy } from "../moveable/GravityFallingMovementStrategy.ts";

@customElement("gravity-falling")
export class GravityFalling extends LitElement {
  @property({ attribute: false })
  public container: CollisionObject = new CollisionObject(
    new Vector2(10, 10),
    new Vector2(200, 500),
  );

  @property({ attribute: false })
  public strategy: GravityFallingMovementStrategy =
    new GravityFallingMovementStrategy();

  public override connectedCallback(): void {
    super.connectedCallback();

    this.style.position = "absolute";
    this.style.left = "0";
    this.style.top = "0";
    this.style.pointerEvents = "none";

    this.syncStrategy();
    this.strategy.calculate(0);
  }

  public get completed(): boolean {
    return this.strategy.isCompleted;
  }

  public updateMovement(deltaSeconds: number): void {
    this.syncStrategy();
    this.strategy.calculate(deltaSeconds);

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
          x=${this.strategy.position.x}
          y=${this.strategy.position.y}
          width=${this.strategy.size.x}
          height=${this.strategy.size.y}
          fill="#60a5fa"
          stroke="#1d4ed8"
          stroke-width="4"
        ></rect>
      </svg>
    `;
  }

  private syncStrategy(): void {
    this.strategy.container = this.container;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "gravity-falling": GravityFalling;
  }
}
