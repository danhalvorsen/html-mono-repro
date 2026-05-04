import { LitElement, css, html, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ITimeObserver, TimeSchdulerObserver } from '../../ObjectObjectTimerObserver.js';
import { GamePolygon } from '../../GamePolygon.js';
import { GamePolygonGeneratorController } from './GamePolygonGeneratorController.js';
import type { Point2 } from '@monorepo/core-math';
import { MultiCurveSvgTemplate } from './MultiCurveSvgTemplate.js';

type CaveGameObjectReferenceTarget = HTMLElement & {
  caveGameObject?: CaveGameObject;
};
/**
 * 
 */
@customElement('cave-game-object')
export class CaveGameObject extends LitElement implements ITimeObserver {
  static override styles = css`
    .cave-layout {
      position: relative;
      width: fit-content;
    }

    .overlay-layer {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    ::slotted([slot='overlay-start']),
    ::slotted([slot='overlay-center']) {
      position: absolute;
      inset: 0;
      display: block;
    }
  `;

  readonly #canvasLength = 500;
  #unsubscribe: (() => void) | null = null;

  @property({ attribute: false })
  scheduler?: TimeSchdulerObserver;

  readonly #curveGenerator = new GamePolygonGeneratorController(this, {
    reference: {
      geometry: {
        canvasLength: this.#canvasLength,
        samplesPerFrame: 700,
        amplitude: 100,
        baselineY: 150,
        periodsAcrossFrame: 4
      },
      noise: {
        noiseWindowSize: 40,
        profileSmoothingPasses: 2,
        spikeSuppressionFactor: 1.35
      }
    },
    upper: {
      geometry: {
        canvasLength: this.#canvasLength,
        amplitude: 100
      },
      distribution: {
        interval: { min: 10, max: 24 },
        skew: 0.25,
        variationInfluence: 5
      },
      noise: {
        noiseAmplifier: 18
      }
    },
    lower: {
      geometry: {
        canvasLength: this.#canvasLength,
        amplitude: 100
      },
      distribution: {
        interval: { min: 6, max: 18 },
        skew: -0.1,
        variationInfluence: 6
      },
      noise: {
        noiseAmplifier: 10
      },
      shape: {
        flattenStrength: 0.5,
        flattenPeriodScale: 0.5
      }
    }
  });

  protected override firstUpdated(): void {
    this.#propagateCaveReferenceToAllSlots();
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (!changed.has('scheduler')) return;
    this.#unsubscribe?.();
    this.#unsubscribe = this.scheduler?.subscribe(this) ?? null;
  }

  disconnectedCallback(): void {
    this.#unsubscribe?.();
    this.#unsubscribe = null;
    super.disconnectedCallback();
  }

  public onTime(time: number): void {
    void time;
  }

  public getReferenceCurve(): readonly Point2[] {
    return this.#curveGenerator.referencePoints;
  }

  public getGeneratedCurves(): {
    readonly reference: readonly Point2[];
    readonly upper: readonly Point2[];
    readonly lower: readonly Point2[];
  } {
    return {
      reference: this.#curveGenerator.referencePoints,
      upper: this.#curveGenerator.upperPoints,
      lower: this.#curveGenerator.lowerPoints
    };
  }

  public getReferenceStartPoint(): Point2 | undefined {
    const first = this.#curveGenerator.referencePoints[0];
    return first ? { x: first.x, y: first.y } : undefined;
  }

  public getReferenceCenterPoint(): Point2 | undefined {
    const points = this.#curveGenerator.referencePoints;
    if (points.length === 0) return undefined;
    const middleIndex = Math.floor(points.length / 2);
    const middle = points[middleIndex];
    return middle ? { x: middle.x, y: middle.y } : undefined;
  }

  #onOverlaySlotChange = (event: Event): void => {
    const slot = event.target as HTMLSlotElement | null;
    this.#propagateCaveReferenceToSlot({ slot });
  };

  #propagateCaveReferenceToAllSlots(): void {
    const startSlot = this.renderRoot.querySelector('slot[name="overlay-start"]') as HTMLSlotElement | null;
    const centerSlot = this.renderRoot.querySelector('slot[name="overlay-center"]') as HTMLSlotElement | null;
    this.#propagateCaveReferenceToSlot({ slot: startSlot });
    this.#propagateCaveReferenceToSlot({ slot: centerSlot });
  }

  #propagateCaveReferenceToSlot(options: { slot: HTMLSlotElement | null }): void {
    if (!options.slot) return;
    const assignedElements = options.slot.assignedElements({ flatten: true });
    for (const element of assignedElements) {
      if (!(element instanceof HTMLElement)) continue;
      (element as CaveGameObjectReferenceTarget).caveGameObject = this;
    }
  }

  protected override render(): TemplateResult {
    const shape = new MultiCurveSvgTemplate(
      this.#curveGenerator.referencePoints,
      this.#curveGenerator.upperPoints,
      this.#curveGenerator.lowerPoints
    );

    return html`
      <h3>Cave Screen</h3>
      <div class="cave-layout">
        <game-polygon .width=${this.#canvasLength * 3} .height=${300} .polygon=${shape as unknown as GamePolygon['polygon']}></game-polygon>
        <div class="overlay-layer">
          <slot name="overlay-start" @slotchange=${this.#onOverlaySlotChange}></slot>
        </div>
        <div class="overlay-layer">
          <slot name="overlay-center" @slotchange=${this.#onOverlaySlotChange}></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cave-game-object': CaveGameObject;
  }
}
