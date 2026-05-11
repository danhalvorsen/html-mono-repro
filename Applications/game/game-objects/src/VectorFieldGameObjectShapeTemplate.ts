import { html, svg, type TemplateResult } from 'lit';
 
import type { SeedPoint } from './VectorField/SeedPointFactory.js';
import type { StreamlinePathBuilder } from './VectorField/StreamlinePathBuilder.js';
import type { VectorFieldGameObjectOptions } from './VectorFieldGameObjectOptions.js';
import { BaseGameObjectShapeTemplate } from './BaseGameObjectShapeTemplate.js';

export interface VectorFieldGameObjectShapeTemplateOptions {
  readonly gameObjectOptions: VectorFieldGameObjectOptions;
  readonly seeds: readonly SeedPoint[];
  readonly pathBuilder: StreamlinePathBuilder;
  readonly timeSeconds: number;
}

export class VectorFieldGameObjectShapeTemplate extends BaseGameObjectShapeTemplate {
  readonly #options: VectorFieldGameObjectShapeTemplateOptions;

  public constructor(options: VectorFieldGameObjectShapeTemplateOptions) {
    super();
    this.#options = options;
  }

  public override render(): TemplateResult {
    const gameObjectOptions = this.#options.gameObjectOptions;
    const bounds = gameObjectOptions.bounds;
    const stroke = gameObjectOptions.stroke;
    const count = Math.min(gameObjectOptions.lineCount, this.#options.seeds.length);

    return html`
      <svg
        width=${bounds.width}
        height=${bounds.height}
        viewBox=${`0 0 ${bounds.width} ${bounds.height}`}
        aria-label="Animated vector field game object"
      >
        <defs>
          <filter id="vector-field-game-object-soften">
            <feGaussianBlur stdDeviation=${stroke.blurStdDeviation}></feGaussianBlur>
          </filter>
        </defs>

        <rect width="100%" height="100%" fill=${stroke.background}></rect>

        <g filter="url(#vector-field-game-object-soften)">
          ${this.#options.seeds.slice(0, count).map((seed, index) => {
            const path = this.#options.pathBuilder.build(seed, this.#options.timeSeconds);
            const isShadow = index % stroke.shadowEvery === 0;

            return svg`
              <path
                d=${path}
                fill="none"
                stroke=${isShadow ? stroke.shadow : stroke.foreground}
                stroke-width=${seed.strokeWidth}
                stroke-linecap="round"
                stroke-linejoin="round"
                opacity=${isShadow ? stroke.shadowOpacity : stroke.foregroundOpacity}
              ></path>
            `;
          })}
        </g>
      </svg>
    `;
  }
}