import { Vector2 } from "@monorepo/core-math";
import {
  MovableObjectDefinitionResolver,
  ParametricMotion,
  RocketMotionDefinitionFactory,
  type IParametricMotion,
  type RocketSpecialOptions,
} from "@monorepo/game-motion";
import { css, html, type CSSResultGroup, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { GameObjectSubject } from "../Game/GameObjectSubject.js";

const ROCKET_SVG_URL = new URL("../assets/rocket.svg", import.meta.url).href;

export interface RocketGameObjectStructureOptions {
  readonly kind: "rocket";
}

export interface RocketGameObjectOptions {
  readonly structure: RocketGameObjectStructureOptions;

  readonly body: {
    readonly mass: number;
  };

  readonly initialConditions: {
    readonly origin: Vector2;

    readonly velocity: {
      readonly speed: number;
      readonly normalizedDirection: Vector2;
    };
  };

  readonly special: RocketSpecialOptions;
}

export interface IRocketGameObjectMotionFactory {
  create(options: RocketGameObjectOptions): IParametricMotion;
}

export class RocketGameObjectMotionFactory implements IRocketGameObjectMotionFactory {
  public create(options: RocketGameObjectOptions): IParametricMotion {
    const definition = new RocketMotionDefinitionFactory().create({
      structure: options.structure,
      body: options.body,
      initialConditions: options.initialConditions,
      special: options.special,
    });

    const resolved = new MovableObjectDefinitionResolver().resolve(definition);

    return new ParametricMotion(resolved.math);
  }
}

@customElement("rocket-game-object")
export class RocketGameObject extends GameObjectSubject {
  static override styles: CSSResultGroup = [
    GameObjectSubject.styles ?? [],
    css`
      :host {
        display: block;
        width: 1500px;
        height: 300px;
        pointer-events: none;
      }

      svg {
        display: block;
        width: 1500px;
        height: 300px;
        overflow: visible;
        pointer-events: none;
      }

      image {
        pointer-events: none;
        user-select: none;
      }
    `,
  ];

  #startedAtMs: number | null = null;
  #rotationDegrees = 0;

  @property({ attribute: false })
  public motion: IParametricMotion = new RocketGameObjectMotionFactory().create({
    structure: {
      kind: "rocket",
    },

    body: {
      mass: 1,
    },

    initialConditions: {
      origin: new Vector2(40, 260),

      velocity: {
        speed: 180,
        normalizedDirection: new Vector2(0.777, -0.629),
      },
    },

    special: {
      gravity: new Vector2(0, 180),

      thrust: {
        normalizedDirection: new Vector2(0.944, -0.33),
        force: [[0, 240]],
      },

      fuel: {
        burnDurationSeconds: 1.8,
      },
    },
  });

  public constructor() {
    super();

    this.size = 16;
    this.fill = "none";
    this.stroke = "#111827";
  }

  public override onTime(time: number): void {
    this.#startedAtMs ??= time;

    const elapsedSeconds = Math.max(0, time - this.#startedAtMs) / 1000;
    const point = this.motion.evaluateAt(elapsedSeconds);

    this.#rotationDegrees =
      (Math.atan2(point.velocity.y, point.velocity.x) * 180) / Math.PI;

    this.setPosistion(point.coordinate);
  }

  public resetMotionClock(): void {
    this.#startedAtMs = null;
  }

  protected override render(): TemplateResult {
    const width = Math.max(36, this.size * 4.5);
    const height = Math.max(14, this.size * 1.5);

    const x = this.positionX - width / 2;
    const y = this.positionY - height / 2;

    const centerX = this.positionX;
    const centerY = this.positionY;

    return html`
    
      <svg viewBox="0 0 1500 300" aria-hidden="true">
        <image
          href=${ROCKET_SVG_URL}
          x=${x}
          y=${y}
          width=${width*4}
          height=${height*4}
          preserveAspectRatio="xMidYMid meet"
          transform=${`rotate(${this.#rotationDegrees} ${centerX} ${centerY})`}
        ></image>
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "rocket-game-object": RocketGameObject;
  }
}

