// FILE: src/views/view-rocket-demo.ts

import { Vector2 } from "@monorepo/core-math";
import { LitElement, css, html, type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import "../Game/Screen/Cave/CaveGameObject.js";
import "@monorepo/game-objects";
import {
  RocketGameObjectMotionFactory,
  type RocketGameObjectOptions,
} from "@monorepo/game-objects";
import { TimeSchdulerObserver } from '@monorepo/game-design-patterns';

const ROCKET_DIRECTION = new Vector2(0.94, -0.34);

const ROCKET_OPTIONS: RocketGameObjectOptions = {
  structure: {
    kind: "rocket",
  },

  body: {
    mass: 1,
  },

  initialConditions: {
    origin: new Vector2(45, 245),

    velocity: {
      speed: 230,
      normalizedDirection: ROCKET_DIRECTION,
    },
  },

  special: {
    gravity: new Vector2(0, 160),

    thrust: {
      normalizedDirection: new Vector2(0.97, -0.24),
      force: [[0, 320]],
    },

    fuel: {
      burnDurationSeconds: 1.2,
    },
  },
};

@customElement("view-rocket-demo")
export class ViewRocketDemo extends LitElement {
  public static override styles = css`
    :host {
      display: block;
    }

    .canvas-shell {
      overflow: hidden;
      border: 1px solid #2a3042;
      border-radius: 12px;
      background: #0f1118;
    }

    cave-game-object {
      display: block;
      width: 100%;
      min-height: 360px;
    }
  `;

  readonly #scheduler = new TimeSchdulerObserver();
  readonly #motion = new RocketGameObjectMotionFactory().create(ROCKET_OPTIONS);

  public override connectedCallback(): void {
    super.connectedCallback();
    this.#scheduler.start();
  }

  public override disconnectedCallback(): void {
    this.#scheduler.stop();
    super.disconnectedCallback();
  }

  protected override render(): TemplateResult {
    return html`
      <section class="canvas-shell">
        <cave-game-object
          .showReferenceCurve=${false}
          .closeUpperLowerToBounds=${true}
        >
          <rectangle-game-object
            slot="overlay-start"
            .childMode=${true}
            .positionX=${45}
            .positionY=${245}
            .size=${24}
            .fill=${"#38bdf8"}
            .stroke=${"#f8fafc"}
          ></rectangle-game-object>

          <rocket-game-object
            slot="overlay-start"
            .scheduler=${this.#scheduler}
            .motion=${this.#motion}
            .fill=${"#f8fafc"}
            .stroke=${"#38bdf8"}
            .size=${14}
          ></rocket-game-object>
        </cave-game-object>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "view-rocket-demo": ViewRocketDemo;
  }
}
