// FILE: src/Game/Screen/Cave/CaveGameObject.ts

import { Vector2 as CollisionVector2, type Point2 } from "@monorepo/core-math";
import {
  Polygon as CollisionPolygon,
  type PolygonCollisionResult,
} from "@monorepo/core-collision-polygons";
import { LitElement, css, html, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import type {
  CollisionObservedGameObject,
  CollisionTargetPolygons,
  ICollisionReactiveController,
} from "../../Collision/CollisionSystemReactiveController.js";
import {
  MultiCurveSvgTemplate,
  type ReferenceCurveRenderStyle,
} from "../../Elements/Polygon/MultiCurveSvgTemplate.js";
import type { GamePolygon } from "@monorepo/game-assets-shapes";
import type { ICamera } from "../../ICamera.js";
import type {
  ITimeObserver,
  TimeSchdulerObserver,
} from "@monorepo/game-design-patterns";
import {
  GamePolygonGeneratorController,
  type IGamePolygonGeneratorOptions,
} from "@monorepo/game-objects";

type CaveNoiseMaterialOptions = {
  readonly patternInset: number;
  readonly upper: {
    readonly baseFrequency: { readonly x: number; readonly y: number };
    readonly numOctaves: number;
    readonly seed: number;
    readonly blurStdDeviation: number;
    readonly baseFill: string;
    readonly overlayOpacity: number;
  };
  readonly lower: {
    readonly baseFrequency: { readonly x: number; readonly y: number };
    readonly numOctaves: number;
    readonly seed: number;
    readonly blurStdDeviation: number;
    readonly baseFill: string;
    readonly overlayOpacity: number;
  };
};

type CaveGameObjectReferenceTarget = HTMLElement & {
  caveGameObject?: CaveGameObject;
};

const DEFAULT_CAVE_CURVE_OPTIONS: IGamePolygonGeneratorOptions = {
  reference: {
    geometry: {
      canvasLength: 500,
      samplesPerFrame: 700,
      amplitude: 100,
      baselineY: 150,
      periodsAcrossFrame: 4,
    },
    noise: {
      noiseWindowSize: 40,
      profileSmoothingPasses: 2,
      spikeSuppressionFactor: 1.35,
    },
  },
  upper: {
    geometry: {
      canvasLength: 500,
      amplitude: 100,
    },
    distribution: {
      interval: { min: 10, max: 24 },
      skew: 0.25,
      variationInfluence: 5,
    },
    noise: {
      noiseAmplifier: 18,
    },
    limits: {
      minDistanceFromReference: 50,
    },
  },
  lower: {
    geometry: {
      canvasLength: 500,
      amplitude: 0.000001,
    },
    distribution: {
      interval: { min: 2, max: 4 },
      skew: -0.1,
      variationInfluence: 0.75,
    },
    noise: {
      noiseAmplifier: 0.5,
    },
    shape: {
      flattenStrength: 1,
      flattenPeriodScale: 0.1,
    },
    limits: {
      minDistanceFromReference: 50,
      maxOffsetFromReference: 6,
    },
  },
};

const TRAINING_CAVE_CURVE_OPTIONS: IGamePolygonGeneratorOptions = {
  reference: {
    geometry: {
      canvasLength: 500,
      samplesPerFrame: 700,
      amplitude: 60,
      baselineY: 150,
      periodsAcrossFrame: 2,
    },
    noise: {
      noiseWindowSize: 28,
      profileSmoothingPasses: 3,
      spikeSuppressionFactor: 1.15,
    },
  },
  upper: {
    geometry: {
      canvasLength: 500,
      amplitude: 70,
    },
    distribution: {
      interval: { min: 14, max: 30 },
      skew: 0.08,
      variationInfluence: 3,
    },
    noise: {
      noiseAmplifier: 10,
    },
    limits: {
      minDistanceFromReference: 62,
    },
  },
  lower: {
    geometry: {
      canvasLength: 500,
      amplitude: 0.000001,
    },
    distribution: {
      interval: { min: 3, max: 7 },
      skew: -0.02,
      variationInfluence: 0.45,
    },
    noise: {
      noiseAmplifier: 0.32,
    },
    shape: {
      flattenStrength: 1,
      flattenPeriodScale: 0.08,
    },
    limits: {
      minDistanceFromReference: 62,
      maxOffsetFromReference: 5,
    },
  },
};

function resolveCurveOptionsPreset(
  preset: string,
): IGamePolygonGeneratorOptions {
  if (preset === "training") {
    return TRAINING_CAVE_CURVE_OPTIONS;
  }

  return DEFAULT_CAVE_CURVE_OPTIONS;
}

@customElement("cave-game-object")
export class CaveGameObject extends LitElement implements ITimeObserver {
  public static override styles = css`
    :host([collision-flash]) .cave-layout {
      filter: drop-shadow(0 0 10px #ef4444) saturate(1.8);
    }

    .camera-viewport {
      position: relative;
      overflow: hidden;
    }

    .cave-layout {
      position: relative;
      width: fit-content;
      transform-origin: left top;
      will-change: transform;
      transition: filter 40ms linear;
    }

    .overlay-layer {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .camera-viewbox {
      position: absolute;
      border: 1px solid rgba(30, 64, 175, 0.9);
      background: rgba(96, 165, 250, 0.25);
      box-sizing: border-box;
      pointer-events: none;
    }

    ::slotted([slot="overlay-start"]),
    ::slotted([slot="overlay-center"]) {
      position: absolute;
      inset: 0;
      display: block;
    }
  `;

  readonly #canvasLength = 500;

  #curveGenerator!: GamePolygonGeneratorController;
  public constructor() {
    super();

    this.#curveGenerator = new GamePolygonGeneratorController(
      this,
      resolveCurveOptionsPreset(this.curveOptionsPreset),
    );
  }
  #unsubscribe: (() => void) | null = null;
  #unsubscribeFromCamera: (() => void) | null = null;
  #lastNoiseReloadAtMs = 0;
  #collisionFlashTimeoutId: number | null = null;

  @property({ attribute: false })
  public scheduler?: TimeSchdulerObserver;

  @property({ attribute: false })
  public camera?: ICamera;

  @property({ attribute: false })
  public collisionReactiveController: ICollisionReactiveController | null =
    null;

  @property({ type: Boolean, reflect: true, attribute: "collision-flash" })
  public collisionFlash = false;

  @property({ type: Number })
  public viewportWidth?: number;

  @property({ type: Number })
  public viewportHeight?: number;

  @property({ type: Boolean })
  public showCameraViewBox = false;

  @property({ type: Boolean })
  public showReferenceCurve = true;

  @property({ type: String })
  public referenceCurveRenderStyle: ReferenceCurveRenderStyle = "solid";

  @property({ type: Boolean })
  public closeUpperLowerToBounds = true;

  @property({ type: String })
  public noiseMaterialOptionsUrl = "/cave-noise-material.json";

  @property({ type: String })
  public curveOptionsPreset = "default";

  @property({ attribute: false })
  public noiseMaterialOptions: Partial<CaveNoiseMaterialOptions> = {
    patternInset: 0.02,
    upper: {
      baseFrequency: { x: 0.12, y: 0.18 },
      numOctaves: 4,
      seed: 11,
      blurStdDeviation: 0,
      baseFill: "#3b271b",
      overlayOpacity: 1,
    },
    lower: {
      baseFrequency: { x: 0.1, y: 0.15 },
      numOctaves: 4,
      seed: 19,
      blurStdDeviation: 0,
      baseFill: "#2e1f15",
      overlayOpacity: 1,
    },
  };

  @property({ type: Number })
  public noiseMaterialReloadIntervalMs = 0;

  protected override async firstUpdated(): Promise<void> {
    await this.#loadNoiseMaterialOptions();
    this.#propagateCaveReferenceToAllSlots();
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (changed.has("curveOptionsPreset")) {
      this.#curveGenerator = new GamePolygonGeneratorController(
        this,
        resolveCurveOptionsPreset(this.curveOptionsPreset),
      );
      this.collisionReactiveController?.checkCollision();
      this.requestUpdate();
    }

    if (changed.has("scheduler")) {
      this.#unsubscribe?.();
      this.#unsubscribe = this.scheduler?.subscribe(this) ?? null;
    }

    if (changed.has("camera")) {
      this.#unsubscribeFromCamera?.();
      this.#unsubscribeFromCamera =
        this.camera?.subscribe(() => this.requestUpdate()) ?? null;
    }

    if (changed.has("collisionReactiveController")) {
      this.collisionReactiveController?.checkCollision();
    }
  }

  public override disconnectedCallback(): void {
    this.#unsubscribe?.();
    this.#unsubscribe = null;

    this.#unsubscribeFromCamera?.();
    this.#unsubscribeFromCamera = null;

    if (this.#collisionFlashTimeoutId !== null) {
      window.clearTimeout(this.#collisionFlashTimeoutId);
      this.#collisionFlashTimeoutId = null;
    }

    this.collisionReactiveController?.setObservedGameObject(null);

    super.disconnectedCallback();
  }

  public observeGameObject(
    gameObject: CollisionObservedGameObject | null,
  ): void {
    this.collisionReactiveController?.setObservedGameObject(gameObject);
    this.collisionReactiveController?.checkCollision();
  }

  public getCollisionTargetPolygons(): CollisionTargetPolygons {
    const curves = this.getGeneratedCurves();

    return {
      upper: this.#createOpenCollisionPolygon(curves.upper),
      lower: this.#createOpenCollisionPolygon(curves.lower),
    };
  }

  public getTargetPolygon(): CollisionPolygon | null {
    return this.getCollisionTargetPolygons().upper;
  }

  public handleCollisionResult(result: PolygonCollisionResult): void {
    if (result.hasCollide) {
      this.flashCollision(90);
    }
  }

  public flashCollision(durationMs = 90): void {
    if (!Number.isFinite(durationMs) || durationMs < 50) {
      throw new RangeError(
        "Collision flash duration must be a finite number >= 50.",
      );
    }

    if (this.#collisionFlashTimeoutId !== null) {
      window.clearTimeout(this.#collisionFlashTimeoutId);
      this.#collisionFlashTimeoutId = null;
    }

    this.collisionFlash = true;

    this.#collisionFlashTimeoutId = window.setTimeout(() => {
      this.collisionFlash = false;
      this.#collisionFlashTimeoutId = null;
    }, durationMs);
  }

  public onTime(time: number): void {
    if (this.noiseMaterialReloadIntervalMs <= 0) {
      return;
    }

    if (time - this.#lastNoiseReloadAtMs < this.noiseMaterialReloadIntervalMs) {
      return;
    }

    this.#lastNoiseReloadAtMs = time;
    void this.#loadNoiseMaterialOptions();
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
      lower: this.#curveGenerator.lowerPoints,
    };
  }

  public getReferenceStartPoint(): Point2 | undefined {
    const first = this.#curveGenerator.referencePoints[0];
    return first ? { x: first.x, y: first.y } : undefined;
  }

  public getReferenceCenterPoint(): Point2 | undefined {
    const points = this.#curveGenerator.referencePoints;

    if (points.length === 0) {
      return undefined;
    }

    const middleIndex = Math.floor(points.length / 2);
    const middle = points[middleIndex];

    return middle ? { x: middle.x, y: middle.y } : undefined;
  }

  public resolveSafeStartPoint(options: {
    readonly x: number;
    readonly size: number;
    readonly fallbackY?: number;
  }): Point2 {
    const curves = this.getGeneratedCurves();
    const upper = this.#findNearestPointByX(curves.upper, options.x);
    const lower = this.#findNearestPointByX(curves.lower, options.x);

    if (upper === null || lower === null) {
      return {
        x: options.x,
        y: options.fallbackY ?? 150,
      };
    }

    const halfSize = Math.max(0, options.size / 2);
    const topY = Math.min(upper.y, lower.y) + halfSize;
    const bottomY = Math.max(upper.y, lower.y) - halfSize;

    if (bottomY < topY) {
      return {
        x: options.x,
        y: (upper.y + lower.y) / 2,
      };
    }

    return {
      x: options.x,
      y: this.#clampNumber(options.fallbackY ?? (topY + bottomY) / 2, topY, bottomY),
    };
  }

  #findNearestPointByX(points: readonly Point2[], x: number): Point2 | null {
    const first = points[0];

    if (first === undefined) {
      return null;
    }

    let nearest = first;
    let nearestDistance = Math.abs(first.x - x);

    for (const point of points) {
      const distance = Math.abs(point.x - x);

      if (distance >= nearestDistance) {
        continue;
      }

      nearest = point;
      nearestDistance = distance;
    }

    return nearest;
  }

  #clampNumber(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }
  readonly #onOverlaySlotChange = (event: Event): void => {
    const slot = event.target as HTMLSlotElement | null;
    this.#propagateCaveReferenceToSlot({ slot });
  };

  #createOpenCollisionPolygon(
    points: readonly { readonly x: number; readonly y: number }[],
  ): CollisionPolygon | null {
    if (points.length < 2) {
      return null;
    }

    return CollisionPolygon.open(
      points.map((point) => new CollisionVector2(point.x, point.y)),
    );
  }

  #propagateCaveReferenceToAllSlots(): void {
    const startSlot = this.renderRoot.querySelector(
      'slot[name="overlay-start"]',
    ) as HTMLSlotElement | null;

    const centerSlot = this.renderRoot.querySelector(
      'slot[name="overlay-center"]',
    ) as HTMLSlotElement | null;

    this.#propagateCaveReferenceToSlot({ slot: startSlot });
    this.#propagateCaveReferenceToSlot({ slot: centerSlot });
  }

  #propagateCaveReferenceToSlot(options: {
    readonly slot: HTMLSlotElement | null;
  }): void {
    if (!options.slot) {
      return;
    }

    const assignedElements = options.slot.assignedElements({ flatten: true });

    for (const element of assignedElements) {
      if (!(element instanceof HTMLElement)) {
        continue;
      }

      (element as CaveGameObjectReferenceTarget).caveGameObject = this;
    }
  }

  async #loadNoiseMaterialOptions(): Promise<void> {
    try {
      const cacheBustedUrl = `${this.noiseMaterialOptionsUrl}?t=${Date.now()}`;
      const response = await fetch(cacheBustedUrl, { cache: "no-store" });

      if (!response.ok) {
        return;
      }

      const json = (await response.json()) as Partial<CaveNoiseMaterialOptions>;

      const mergedUpper = {
        ...(this.noiseMaterialOptions.upper ?? {}),
        ...(json.upper ?? {}),
      } as CaveNoiseMaterialOptions["upper"];

      const mergedLower = {
        ...(this.noiseMaterialOptions.lower ?? {}),
        ...(json.lower ?? {}),
      } as CaveNoiseMaterialOptions["lower"];

      this.noiseMaterialOptions = {
        ...this.noiseMaterialOptions,
        ...json,
        upper: mergedUpper,
        lower: mergedLower,
      };
    } catch {
      // Keep built-in defaults if runtime JSON is missing or invalid.
    }
  }

  protected override render(): TemplateResult {
    const worldWidth = this.#canvasLength * 3;
    const worldHeight = 300;
    const cameraView = this.camera?.getView();
    const isMiniMap = this.showCameraViewBox;

    const viewportWidth = this.viewportWidth ?? cameraView?.width ?? worldWidth;
    const viewportHeight =
      this.viewportHeight ?? cameraView?.height ?? worldHeight;

    const scale = isMiniMap
      ? Math.min(viewportWidth / worldWidth, viewportHeight / worldHeight)
      : 1;

    const scaledWorldWidth = worldWidth * scale;
    const scaledWorldHeight = worldHeight * scale;

    const offsetX = isMiniMap
      ? (viewportWidth - scaledWorldWidth) / 2
      : cameraView
      ? -cameraView.x
      : 0;

    const offsetY = isMiniMap
      ? (viewportHeight - scaledWorldHeight) / 2
      : cameraView
      ? -cameraView.y
      : 0;

    const transform = `translate3d(${offsetX}px, ${offsetY}px, 0) scale(${scale})`;

    const cameraViewBoxStyle = cameraView
      ? styleMap({
          left: `${offsetX + cameraView.x * scale}px`,
          top: `${offsetY + cameraView.y * scale}px`,
          width: `${cameraView.width * scale}px`,
          height: `${cameraView.height * scale}px`,
        })
      : undefined;

    const shape = new MultiCurveSvgTemplate(
      this.#curveGenerator.referencePoints,
      this.#curveGenerator.upperPoints,
      this.#curveGenerator.lowerPoints,
      {
        showReferenceCurve: this.showReferenceCurve,
        referenceCurveRenderStyle: this.referenceCurveRenderStyle,
        closeCurvesToBounds: this.closeUpperLowerToBounds,
        boundsWidth: worldWidth,
        boundsHeight: worldHeight,
      },
    );

    return html`
      <div
        class="camera-viewport"
        style=${styleMap({
          width: `${viewportWidth}px`,
          height: `${viewportHeight}px`,
        })}
      >
        <div
          class="cave-layout"
          style=${styleMap({
            transform,
          })}
        >
          <game-polygon
            .width=${worldWidth}
            .height=${worldHeight}
            .polygon=${shape as unknown as GamePolygon["polygon"]}
          ></game-polygon>

          <div class="overlay-layer">
            <slot
              name="overlay-start"
              @slotchange=${this.#onOverlaySlotChange}
            ></slot>
          </div>

          <div class="overlay-layer">
            <slot
              name="overlay-center"
              @slotchange=${this.#onOverlaySlotChange}
            ></slot>
          </div>
        </div>

        ${this.showCameraViewBox && cameraView
          ? html`<div class="camera-viewbox" style=${cameraViewBoxStyle}></div>`
          : null}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "cave-game-object": CaveGameObject;
  }
}
