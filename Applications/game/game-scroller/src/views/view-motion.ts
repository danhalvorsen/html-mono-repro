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
    circular-animation {
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
  `;

  private readonly baseObjectShape = new SvgCircleTemplate({
    width: 56,
    height: 56,
    radius: 20,
    fill: "#22c55e",
    stroke: "#14532d",
    strokeWidth: 2,
  });

  protected override render(): TemplateResult {
    return html`
      <section class="panel">
        <h2>Motion</h2>
        <p>Main scene:</p>
      </section>

      <section class="panel">
        <h2>Motion</h2>
        <scheduler-wc>
          <linear-animation
            slot="animation"
            .startX=${40}
            .startY=${40}
            .endX=${320}
            .endY=${190}
            .initialVelocity=${80}
            .acceleration=${100}
          >
            <base-game-object
              .shapeTemplate=${this.baseObjectShape}
            ></base-game-object>
          </linear-animation>

          <circular-animation
            slot="animation"
            .centerX=${160}
            .centerY=${110}
            .radius=${70}
            .frequencyHz=${0.5}
          >
            <base-game-object
              .shapeTemplate=${this.baseObjectShape}
            ></base-game-object>
          </circular-animation>

         <circular-animation
  slot="animation"
  .centerX=${160}
  .centerY=${110}
  .radius=${70}
  .frequencyHz=${0.5}
>
  <particle-game-object
    .shapeTemplate=${new SvgCircleTemplate({
      width: 16,
      height: 16,
      radius: 6,
      fill: "#f43f5e",
      stroke: "#881337",
      strokeWidth: 1
    })}
  ></particle-game-object>
</circular-animation>
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
