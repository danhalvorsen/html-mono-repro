import { Vector2 } from '@monorepo/core-math';
import {
  Cave,
  CoefficientReferenceCurveGenerator,
  ProgressiveTriangleStrip,
  defaultReferenceCurveDefinition,
  type CaveScene,
  type ProgressiveTriangleStripOptions,
  type ProgressiveTriangleStripResult,
  type ReferenceCurveDefinition,
} from '@monorepo/game-feature-cave';
import { css, html, type CSSResultGroup, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { BaseGameObject } from './BaseGameObject.js';
import type { BaseGameObjectOptions } from './BaseGameObjectOptions.js';
import { CaveBaseGameObjectShapeTemplate } from './CaveBaseGameObjectShapeTemplate.js';
import './TriangleStripGameObject.js';

const DEFAULT_WORLD_WIDTH = 500;
const MIN_WORLD_WIDTH = 320;
const WORLD_HEIGHT = 300;

@customElement('cave-base-game-object')
export class CaveGameObject extends BaseGameObject {
  public static override styles: CSSResultGroup = [
    BaseGameObject.styles ?? [],
    css`
      :host {
        display: block;
        position: relative;
        width: 100%;
        min-width: ${MIN_WORLD_WIDTH}px;
        height: ${WORLD_HEIGHT}px;
        border: 1px solid #2a3042;
        border-radius: 12px;
        background: #0f1118;
        overflow: hidden;
        pointer-events: auto;
      }

      .controls {
        pointer-events: auto;
        position: absolute;
        top: 8px;
        right: 8px;
        z-index: 1000;
        width: min(230px, calc(100% - 16px));
        display: grid;
        gap: 6px;
        padding: 8px;
        border: 1px solid #26314f;
        border-radius: 10px;
        background: rgba(13, 18, 32, 0.92);
        color: #e5e7eb;
        font: 12px/1.2 system-ui, sans-serif;
      }

      .control {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 6px;
        align-items: center;
      }

      .control label {
        color: #cbd5e1;
      }

      .control output {
        color: #93c5fd;
        font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      }

      .control input {
        grid-column: 1 / -1;
        width: 100%;
        pointer-events: auto;
      }

      .buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      button {
        pointer-events: auto;
        border: 1px solid #3b82f6;
        background: #14213d;
        color: #e5e7eb;
        padding: 5px 8px;
        border-radius: 7px;
        font: inherit;
        cursor: pointer;
      }

      button:hover {
        background: #1d2f57;
      }

      .stats {
        color: #94a3b8;
        font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      }
    `,
  ];

  @property({ type: Boolean })
  public showTriangleStrip = true;

  @property({ type: Boolean })
  public showCollisionPolygon = true;

  @property({ type: Number })
  public referenceAmplitude = 42;

  @property({ type: Number })
  public referencePeriodsAcrossFrame = 2;

  @property({ type: Number })
  public referencePhase = 0;

  @property({ type: Number })
  public verticalSlope = 0;

  @property({ type: Number })
  public referenceSamplesPerFrame = 180;

  @property({ type: Number })
  public caveHalfHeight = 64;

  @property({ type: Number })
  public maximumVerticalDeviation = 10;

  @property({ type: Number })
  public maximumDerivativeDelta = 0.07;

  @property({ type: Number })
  public maximumPointStride = 48;

  @property({ type: Number })
  public minimumPointStride = 1;

  @state()
  private worldWidth = DEFAULT_WORLD_WIDTH;

  #scene!: CaveScene;
  #triangleStrip!: ProgressiveTriangleStripResult;
  #resizeObserver: ResizeObserver | null = null;

  public constructor() {
    super();

    this.positionX = DEFAULT_WORLD_WIDTH / 2;
    this.positionY = WORLD_HEIGHT / 2;
    this.options = this.createBaseGameObjectOptions();

    this.rebuildCave();
  }

  public override connectedCallback(): void {
    super.connectedCallback();

    this.#resizeObserver = new ResizeObserver(() => {
      this.updateResponsiveWidth();
    });

    this.#resizeObserver.observe(this);

    queueMicrotask(() => this.updateResponsiveWidth());
  }

  public override disconnectedCallback(): void {
    this.#resizeObserver?.disconnect();
    this.#resizeObserver = null;

    super.disconnectedCallback();
  }

  protected override render(): TemplateResult {
    return html`
      <section class="controls" @click=${this.stopEvent}>
        ${this.renderRange({
          label: 'amplitude',
          value: this.referenceAmplitude,
          min: -90,
          max: 90,
          step: 1,
          onInput: this.onReferenceAmplitudeInput,
        })}

        ${this.renderRange({
          label: 'periods',
          value: this.referencePeriodsAcrossFrame,
          min: 0.25,
          max: 8,
          step: 0.25,
          onInput: this.onReferencePeriodsInput,
        })}

        ${this.renderRange({
          label: 'phase',
          value: this.referencePhase,
          min: -3.14,
          max: 3.14,
          step: 0.01,
          onInput: this.onReferencePhaseInput,
        })}

        ${this.renderRange({
          label: 'vertical slope',
          value: this.verticalSlope,
          min: -180,
          max: 180,
          step: 1,
          onInput: this.onVerticalSlopeInput,
        })}

        ${this.renderRange({
          label: 'samples',
          value: this.referenceSamplesPerFrame,
          min: 20,
          max: 400,
          step: 10,
          onInput: this.onReferenceSamplesInput,
        })}

        ${this.renderRange({
          label: 'cave height',
          value: this.caveHalfHeight,
          min: 20,
          max: 120,
          step: 1,
          onInput: this.onCaveHalfHeightInput,
        })}

        ${this.renderRange({
          label: 'vertical error',
          value: this.maximumVerticalDeviation,
          min: 0,
          max: 40,
          step: 1,
          onInput: this.onMaximumVerticalDeviationInput,
        })}

        ${this.renderRange({
          label: 'derivative error',
          value: this.maximumDerivativeDelta,
          min: 0,
          max: 0.5,
          step: 0.01,
          onInput: this.onMaximumDerivativeDeltaInput,
        })}

        ${this.renderRange({
          label: 'max stride',
          value: this.maximumPointStride,
          min: 2,
          max: 120,
          step: 1,
          onInput: this.onMaximumPointStrideInput,
        })}

        <div class="buttons">
          <button type="button" @click=${this.toggleTriangleStrip}>
            strip: ${this.showTriangleStrip ? 'on' : 'off'}
          </button>

          <button type="button" @click=${this.toggleCollisionPolygon}>
            hull: ${this.showCollisionPolygon ? 'on' : 'off'}
          </button>
        </div>

        <div class="stats">
          width=${this.worldWidth}
          visual=${this.#scene.polygon.points.length}
          strip=${this.#triangleStrip.polygon.points.length}
          retained=${this.#triangleStrip.retainedIndices.length}
        </div>
      </section>

      ${super.render()}

      <triangle-strip-game-object
        .positionX=${this.worldWidth / 2}
        .positionY=${WORLD_HEIGHT / 2}
        .options=${this.createBaseGameObjectOptions()}
        .worldWidth=${this.worldWidth}
        .worldHeight=${WORLD_HEIGHT}
        .triangleStrip=${this.#triangleStrip}
        .visible=${this.showTriangleStrip}
      ></triangle-strip-game-object>
    `;
  }

  private updateResponsiveWidth(): void {
    const measuredWidth = Math.round(this.getBoundingClientRect().width);
    const nextWidth = Math.max(
      MIN_WORLD_WIDTH,
      measuredWidth || DEFAULT_WORLD_WIDTH,
    );

    if (nextWidth === this.worldWidth) {
      return;
    }

    this.worldWidth = nextWidth;
    this.positionX = nextWidth / 2;
    this.options = this.createBaseGameObjectOptions();
    this.rebuildCave();
  }

  private renderRange(options: {
    readonly label: string;
    readonly value: number;
    readonly min: number;
    readonly max: number;
    readonly step: number;
    readonly onInput: (event: Event) => void;
  }): TemplateResult {
    return html`
      <div class="control">
        <label>${options.label}</label>
        <output>${this.formatNumber(options.value)}</output>
        <input
          type="range"
          min=${options.min}
          max=${options.max}
          step=${options.step}
          .value=${String(options.value)}
          @input=${options.onInput}
        />
      </div>
    `;
  }

  private readonly onReferenceAmplitudeInput = (event: Event): void => {
    this.referenceAmplitude = this.readRangeNumber(event);
    this.rebuildCave();
  };

  private readonly onReferencePeriodsInput = (event: Event): void => {
    this.referencePeriodsAcrossFrame = this.readRangeNumber(event);
    this.rebuildCave();
  };

  private readonly onReferencePhaseInput = (event: Event): void => {
    this.referencePhase = this.readRangeNumber(event);
    this.rebuildCave();
  };

  private readonly onVerticalSlopeInput = (event: Event): void => {
    this.verticalSlope = this.readRangeNumber(event);
    this.rebuildCave();
  };

  private readonly onReferenceSamplesInput = (event: Event): void => {
    this.referenceSamplesPerFrame = Math.round(this.readRangeNumber(event));
    this.rebuildCave();
  };

  private readonly onCaveHalfHeightInput = (event: Event): void => {
    this.caveHalfHeight = this.readRangeNumber(event);
    this.rebuildCave();
  };

  private readonly onMaximumVerticalDeviationInput = (event: Event): void => {
    this.maximumVerticalDeviation = this.readRangeNumber(event);
    this.rebuildCave();
  };

  private readonly onMaximumDerivativeDeltaInput = (event: Event): void => {
    this.maximumDerivativeDelta = this.readRangeNumber(event);
    this.rebuildCave();
  };

  private readonly onMaximumPointStrideInput = (event: Event): void => {
    this.maximumPointStride = Math.round(this.readRangeNumber(event));
    this.rebuildCave();
  };

  private readonly toggleTriangleStrip = (event: Event): void => {
    event.preventDefault();
    event.stopPropagation();

    this.showTriangleStrip = !this.showTriangleStrip;
  };

  private readonly toggleCollisionPolygon = (event: Event): void => {
    event.preventDefault();
    event.stopPropagation();

    this.showCollisionPolygon = !this.showCollisionPolygon;
    this.rebuildCaveShapeTemplate();
  };

  private readonly stopEvent = (event: Event): void => {
    event.stopPropagation();
  };

  private rebuildCave(): void {
    const generated = createCaveScene({
      worldWidth: this.worldWidth,
      amplitude: this.referenceAmplitude,
      periodsAcrossFrame: this.referencePeriodsAcrossFrame,
      phase: this.referencePhase,
      verticalSlope: this.verticalSlope,
      samplesPerFrame: this.referenceSamplesPerFrame,
      caveHalfHeight: this.caveHalfHeight,
      progressiveTriangleStripOptions: {
        maximumVerticalDeviation: this.maximumVerticalDeviation,
        maximumDerivativeDelta: this.maximumDerivativeDelta,
        minimumPointStride: this.minimumPointStride,
        maximumPointStride: this.maximumPointStride,
      },
    });

    this.#scene = generated.scene;
    this.#triangleStrip = generated.triangleStrip;
    this.rebuildCaveShapeTemplate();
    this.requestUpdate();
  }

  private rebuildCaveShapeTemplate(): void {
    this.shapeTemplate = new CaveBaseGameObjectShapeTemplate({
      scene: this.#scene,
      width: this.worldWidth,
      height: WORLD_HEIGHT,
      showCollisionPolygon: this.showCollisionPolygon,
    });
  }

  private createBaseGameObjectOptions(): BaseGameObjectOptions {
    return {
      width: this.worldWidth,
      height: WORLD_HEIGHT,
      rotationRadians: 0,
    };
  }

  private readRangeNumber(event: Event): number {
    const target = event.target;

    if (!(target instanceof HTMLInputElement)) {
      throw new Error('Expected range input event target.');
    }

    const value = Number(target.value);

    if (!Number.isFinite(value)) {
      throw new Error(`Invalid range input value: ${target.value}`);
    }

    return value;
  }

  private formatNumber(value: number): string {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }
}

interface CaveRuntimeOptions {
  readonly worldWidth: number;
  readonly amplitude: number;
  readonly periodsAcrossFrame: number;
  readonly phase: number;
  readonly verticalSlope: number;
  readonly samplesPerFrame: number;
  readonly caveHalfHeight: number;
  readonly progressiveTriangleStripOptions: ProgressiveTriangleStripOptions;
}

function createCaveScene(options: CaveRuntimeOptions): {
  readonly scene: CaveScene;
  readonly triangleStrip: ProgressiveTriangleStripResult;
} {
  const referenceCurve = new CoefficientReferenceCurveGenerator().create(
    createReferenceDefinition(options),
  );

  const referencePoints = applyVerticalSlope(
    referenceCurve.points,
    options.worldWidth,
    options.verticalSlope,
  );

  const upperPoints = offsetPoints(referencePoints, -options.caveHalfHeight);
  const lowerPoints = offsetPoints(referencePoints, options.caveHalfHeight);

  const triangleStrip = new ProgressiveTriangleStrip(
    upperPoints,
    lowerPoints,
    options.progressiveTriangleStripOptions,
  ).create();

  const scene = new Cave().create({
    referencePoints,
    upperPoints,
    lowerPoints,
    collisionUpperPoints: triangleStrip.upperPoints,
    collisionLowerPoints: triangleStrip.lowerPoints,
  });

  return {
    scene,
    triangleStrip,
  };
}

function createReferenceDefinition(
  options: CaveRuntimeOptions,
): ReferenceCurveDefinition {
  return {
    ...defaultReferenceCurveDefinition,
    frame: {
      canvas: {
        length: options.worldWidth,
      },
      sampling: {
        samplesPerFrame: options.samplesPerFrame,
      },
    },
    expression: {
      ...defaultReferenceCurveDefinition.expression,
      vertical: {
        baselineY: WORLD_HEIGHT / 2,
        amplitude: options.amplitude,
      },
      horizontal: {
        periodsAcrossFrame: options.periodsAcrossFrame,
        phase: options.phase,
      },
    },
  };
}

function applyVerticalSlope(
  points: readonly Vector2[],
  worldWidth: number,
  verticalSlope: number,
): readonly Vector2[] {
  return points.map(point => {
    const normalizedX = worldWidth > 0 ? point.x / worldWidth : 0;
    return new Vector2(point.x, point.y + verticalSlope * normalizedX);
  });
}

function offsetPoints(
  points: readonly Vector2[],
  yOffset: number,
): readonly Vector2[] {
  return points.map(point => new Vector2(point.x, point.y + yOffset));
}

declare global {
  interface HTMLElementTagNameMap {
    'cave-base-game-object': CaveGameObject;
  }
}
