import "@monorepo/game-motion-animation/pure-animation";
import { SvgCircleTemplate } from "@monorepo/game-objects";
import { LitElement, css, html, type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import "../Game/index.js";

@customElement("view-motion")
export class ViewMotion extends LitElement {
  public static override styles = css`
    :host {
      display: block;
    }

    .panel {
      border: 1px solid #2a3042;
      border-radius: 12px;
      background: #121523;
      padding: 14px;
      margin-bottom: 12px;
    }

    h2 {
      margin: 0 0 10px 0;
      font-size: 16px;
      color: #bdc8f4;
    }

    scheduler-wc {
      position: relative;
      display: block;
      min-height: 260px;
    }

    linear-animation,
    circular-animation,
    projectile-animation {
      position: absolute;
      inset: 0;
      display: block;
      pointer-events: none;
    }

    linear-animation {
      z-index: 1;
    }

    circular-animation {
      z-index: 2;
    }

    projectile-animation {
      z-index: 3;
    }
  `;

  private readonly baseObjectShape = new SvgCircleTemplate({
    width: 56,
    height: 56,
    radius: 20,
    fill: "#22c55e",
    stroke: "#14532d",
    strokeWidth: 2,
  });

  private readonly baseObjectShape2 = new SvgCircleTemplate({
    width: 6,
    height: 6,
    radius: 10,
    fill: "#A2c55e",
    stroke: "#14532d",
    strokeWidth: 2,
  });

  protected override render(): TemplateResult {
    return html`<section>
  <h4>Single Particle</h4>
  <scheduler-wc>
    <projectile-animation
      slot="animation"
      .startX=${40}
      .startY=${220}
      .v0=${120}
      .angle=${55}
      .g=${9.81}
    >
      <particle-game-object
        .lifetimeMin=${9000}
        .lifetimeMax=${12000}
        .shapeTemplate=${this.baseObjectShape2}
      ></particle-game-object>
    </projectile-animation>
  </scheduler-wc>
</section>

<section>
  <h4>Emitter Particle</h4>
  <scheduler-wc>
    <particle-game-object-emitter
      slot="animation"
      .startX=${500}
      .startY=${900}
      .worldHeight=${1000}
      .v0=${100}
      .speedVariance=${300}
      .angle=${86}
      .directionVarianceDegrees=${15}
      .g=${9.81}
      .particleCount=${1500}
      .lifetimeMin=${1000}
      .lifetimeMax=${5000}
      .emitterHeadSize=${22}
      .emitterHeadFill=${"#f59e0b"}
      .emitterHeadStroke=${"#FF1827"}
      .shapeTemplate=${this.baseObjectShape}
    ></particle-game-object-emitter>
  </scheduler-wc>
</section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "view-motion": ViewMotion;
  }
}
