import { LitElement, html, svg, type SVGTemplateResult, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ITimeObserver, TimeSchdulerObserver } from '../../ObjectObjectTimerObserver.js';
import { type ISvgTemplate, GamePolygon } from '../../GamePolygon.js';
import { GamePolygonGeneratorController } from './GamePolygonGeneratorController.js';
import type { Point2 } from '@monorepo/core-math';

class MultiCurveSvgTemplate implements ISvgTemplate {
  readonly #reference: readonly Point2[];
  readonly #upper: readonly Point2[];
  readonly #lower: readonly Point2[];

  public constructor(
    reference: readonly Point2[],
    upper: readonly Point2[],
    lower: readonly Point2[]
  ) {
    this.#reference = reference;
    this.#upper = upper;
    this.#lower = lower;
  }

  public get svg(): SVGTemplateResult {
    return svg`
      <polyline points=${toPoints(this.#upper)} fill="none" stroke="#22c55e" stroke-width="2"></polyline>
      <polyline points=${toPoints(this.#reference)} fill="none" stroke="#0ea5e9" stroke-width="2"></polyline>
      <polyline points=${toPoints(this.#lower)} fill="none" stroke="#ef4444" stroke-width="2"></polyline>
    `;
  }
}

function toPoints(points: readonly Point2[]): string {
  return points.map((p) => `${p.x},${p.y}`).join(' ');
}

@customElement('cave-game-object')
export class CaveGameObject extends LitElement implements ITimeObserver {
  readonly #canvasLength = 500;
  #unsubscribe: (() => void) | null = null;

  @property({ attribute: false })
  scheduler?: TimeSchdulerObserver;

  readonly #curveGenerator = new GamePolygonGeneratorController(this, {
    canvasLength: this.#canvasLength,
    amplitude: 100,
    baselineY: 150,
    periodsAcrossFrame: 4,
    samplesPerFrame: 1200,
    upperInterval: { min: 16, max: 48 },
    lowerInterval: { min: 6, max: 18 },
    upperSkew: 0.55,
    lowerSkew: -0.1,
    noiseWindowSize: 28,
    upperNoiseAmplifier: 100,
    lowerNoiseAmplifier: 10,
    upperVariationInfluence: 16,
    lowerVariationInfluence: 6
  });

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

  protected override render(): TemplateResult {
    const shape = new MultiCurveSvgTemplate(
      this.#curveGenerator.referencePoints,
      this.#curveGenerator.upperPoints,
      this.#curveGenerator.lowerPoints
    );

    return html`
      <h3>Cave Screen</h3>
      <game-polygon .width=${this.#canvasLength * 3} .height=${300} .polygon=${shape as unknown as GamePolygon['polygon']}></game-polygon>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cave-game-object': CaveGameObject;
  }
}
