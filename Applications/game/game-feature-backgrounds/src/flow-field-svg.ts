import { LitElement, css, html, svg, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CurlNoiseVectorField } from './VectorField/CurlNoiseVectorField.js';
import { PerlinNoise3 } from './VectorField/PerlinNoise3.js';
import { StreamlinePathBuilder } from './VectorField/StreamlinePathBuilder.js';
import type { Bounds, Vector2 } from './VectorField/IVectorField.js';
import type { INoise3 } from './VectorField/INoise3.js';

interface SeedPoint extends Vector2 {
  readonly strokeWidth: number;
}

const ViewBox: Bounds = {
  width: 800,
  height: 800,
};

@customElement('flow-field-svg')
export class FlowFieldSvgElement extends LitElement {
  public static readonly styles = css`
    :host {
      display: block;
      width: 800px;
      height: 800px;
      background: #000;
    }

    svg {
      width: 100%;
      height: 100%;
      display: block;
      background: #000;
    }

    path {
      fill: none;
      stroke-linecap: round;
      stroke-linejoin: round;
      vector-effect: non-scaling-stroke;
    }
  `;

  @property({ type: Number })
  public lineCount = 260;

  @property({ type: Number })
  public animationSpeed = 1;

  @state()
  private timeSeconds = 0;

  readonly #noise: INoise3 = new PerlinNoise3(92831);

  readonly #vectorField = new CurlNoiseVectorField(this.#noise, {
    scale: 0.0045,
    timeScale: 0.12,
    derivativeStep: 0.03,
  });

  readonly #pathBuilder = new StreamlinePathBuilder(this.#vectorField, {
    stepLength: 4.5,
    steps: 90,
    bounds: ViewBox,
  });

  readonly #seeds = this.#createSeeds(320);
  #animationFrameId: number | undefined;

  public connectedCallback(): void {
    super.connectedCallback();
    this.#startAnimation();
  }

  public disconnectedCallback(): void {
    this.#stopAnimation();
    super.disconnectedCallback();
  }

  protected render(): TemplateResult {
    const count = Math.min(this.lineCount, this.#seeds.length);
    const time = this.timeSeconds * this.animationSpeed;

    return html`
      <svg viewBox="0 0 ${ViewBox.width} ${ViewBox.height}" aria-label="Animated SVG curl noise vector field">
        <defs>
          <filter id="flow-field-soften">
            <feGaussianBlur stdDeviation="0.45"></feGaussianBlur>
          </filter>
        </defs>

        <rect width="100%" height="100%" fill="#000"></rect>

        <g filter="url(#flow-field-soften)">
          ${this.#seeds.slice(0, count).map((seed, index) => {
            const path = this.#pathBuilder.build(seed, time);

            return svg`
              <path
                d=${path}
                stroke=${index % 6 === 0 ? '#111' : '#fff'}
                stroke-width=${seed.strokeWidth}
                opacity=${index % 6 === 0 ? 0.9 : 0.96}
              ></path>
            `;
          })}
        </g>
      </svg>
    `;
  }

  #startAnimation(): void {
    let previous = performance.now();

    const tick = (now: number): void => {
      const deltaSeconds = Math.min((now - previous) / 1000, 0.05);
      previous = now;

      this.timeSeconds += deltaSeconds;
      this.#animationFrameId = requestAnimationFrame(tick);
    };

    this.#animationFrameId = requestAnimationFrame(tick);
  }

  #stopAnimation(): void {
    if (this.#animationFrameId === undefined) {
      return;
    }

    cancelAnimationFrame(this.#animationFrameId);
    this.#animationFrameId = undefined;
  }

  #createSeeds(count: number): SeedPoint[] {
    let state = 312987;

    const random = (): number => {
      state = (1664525 * state + 1013904223) >>> 0;
      return state / 0x100000000;
    };

    return Array.from({ length: count }, () => ({
      x: random() * ViewBox.width,
      y: random() * ViewBox.height,
      strokeWidth: 4 + random() * 10,
    }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'flow-field-svg': FlowFieldSvgElement;
  }
}