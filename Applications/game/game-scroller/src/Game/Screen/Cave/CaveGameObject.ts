import { Vector2 as CollisionVector2, type Point2 } from '@monorepo/core-math';
import {
  Polygon as CollisionPolygon,
  type PolygonCollisionResult,
} from '@monorepo/core-collision-polygons';
import { LitElement, css, html, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import type {
  CollisionObservedGameObject,
  CollisionTargetPolygons,
  ICollisionReactiveController,
} from '../../Collision/CollisionSystemReactiveController.js';
import { MultiCurveSvgTemplate, type ReferenceCurveRenderStyle } from '../../Elements/Polygon/MultiCurveSvgTemplate.js';
import type { GamePolygon } from '../../Elements/Polygon/GamePolygon.js';
import type { ICamera } from '../../ICamera.js';
import type {
  ITimeObserver,
  TimeSchdulerObserver,
} from '../../TimeSchdulerObserver.js';
import {
  GamePolygonGeneratorController,
} from '../../../GameObjects/GamePolygonGeneratorController.js';
import {
  CaveCurveOptionsValue,
  CaveNoiseOptionsValue,
  CaveRenderOptionsValue,
  CaveViewportOptionsValue,
  MergeCaveNoiseMaterialOptions,
  type CaveCurveOptions,
  type CaveNoiseMaterialOptions,
  type CaveNoiseOptions,
  type CaveRenderOptions,
  type CaveViewportOptions,
} from './CaveGameObjectOptions.js';
import {
  DefaultCaveCurveOptionsPresetResolver,
  type CaveCurveOptionsPresetResolver,
} from './CaveCurveOptionsPresetResolver.js';

type CaveGameObjectReferenceTarget = HTMLElement & {
  caveGameObject?: CaveGameObject;
};

@customElement('cave-game-object')
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

    ::slotted([slot='overlay-start']),
    ::slotted([slot='overlay-center']) {
      position: absolute;
      inset: 0;
      display: block;
    }
  `;

  readonly #canvasLength = 500;
  readonly #curveOptionsPresetResolver: CaveCurveOptionsPresetResolver =
    new DefaultCaveCurveOptionsPresetResolver();
  readonly #noiseMaterialMerger = new MergeCaveNoiseMaterialOptions();

  #curveGenerator!: GamePolygonGeneratorController;
  #unsubscribe: (() => void) | null = null;
  #unsubscribeFromCamera: (() => void) | null = null;
  #lastNoiseReloadAtMs = 0;
  #collisionFlashTimeoutId: number | null = null;

  @property({ attribute: false })
  public scheduler?: TimeSchdulerObserver;

  @property({ attribute: false })
  public camera?: ICamera;

  @property({ attribute: false })
  public collisionReactiveController: ICollisionReactiveController | null = null;

  @property({ type: Boolean, reflect: true, attribute: 'collision-flash' })
  public collisionFlash = false;

  @property({ attribute: false })
  public viewportOptions: CaveViewportOptions =
    CaveViewportOptionsValue.createDefault();

@property({ attribute: false })
public caveRenderOptions: CaveRenderOptions =
  CaveRenderOptionsValue.createDefault();

  @property({ attribute: false })
  public curveOptions: CaveCurveOptions =
    CaveCurveOptionsValue.createDefault();

  @property({ attribute: false })
  public noiseOptions: CaveNoiseOptions =
    CaveNoiseOptionsValue.createDefault();

  public constructor() {
    super();

    this.#curveGenerator = new GamePolygonGeneratorController(
      this,
      this.#curveOptionsPresetResolver.resolve(this.curveOptions.preset)
    );
  }

  public get viewportWidth(): number | undefined {
    return this.viewportOptions.width;
  }

  @property({ type: Number })
  public set viewportWidth(value: number | undefined) {
    this.viewportOptions = new CaveViewportOptionsValue(
      value,
      this.viewportOptions.height,
      this.viewportOptions.showCameraViewBox
    );
  }

  public get viewportHeight(): number | undefined {
    return this.viewportOptions.height;
  }

  @property({ type: Number })
  public set viewportHeight(value: number | undefined) {
    this.viewportOptions = new CaveViewportOptionsValue(
      this.viewportOptions.width,
      value,
      this.viewportOptions.showCameraViewBox
    );
  }

  public get showCameraViewBox(): boolean {
    return this.viewportOptions.showCameraViewBox;
  }

  @property({ type: Boolean })
  public set showCameraViewBox(value: boolean) {
    this.viewportOptions = new CaveViewportOptionsValue(
      this.viewportOptions.width,
      this.viewportOptions.height,
      value
    );
  }

  public get showReferenceCurve(): boolean {
    return this.caveRenderOptions.showReferenceCurve;
  }

  @property({ type: Boolean })
  public set showReferenceCurve(value: boolean) {
    this.caveRenderOptions = new CaveRenderOptionsValue(
      value,
      this.caveRenderOptions.referenceCurveRenderStyle,
      this.caveRenderOptions.closeUpperLowerToBounds
    );
  }

  public get referenceCurveRenderStyle(): ReferenceCurveRenderStyle {
    return this.caveRenderOptions.referenceCurveRenderStyle;
  }

  @property({ type: String })
  public set referenceCurveRenderStyle(value: ReferenceCurveRenderStyle) {
    this.caveRenderOptions = new CaveRenderOptionsValue(
      this.caveRenderOptions.showReferenceCurve,
      value,
      this.caveRenderOptions.closeUpperLowerToBounds
    );
  }

  public get closeUpperLowerToBounds(): boolean {
    return this.caveRenderOptions.closeUpperLowerToBounds;
  }

  @property({ type: Boolean })
  public set closeUpperLowerToBounds(value: boolean) {
    this.caveRenderOptions = new CaveRenderOptionsValue(
      this.caveRenderOptions.showReferenceCurve,
      this.caveRenderOptions.referenceCurveRenderStyle,
      value
    );
  }

  public get curveOptionsPreset(): string {
    return this.curveOptions.preset;
  }

  @property({ type: String })
  public set curveOptionsPreset(value: string) {
    this.curveOptions = new CaveCurveOptionsValue(value);
  }

  public get noiseMaterialOptionsUrl(): string {
    return this.noiseOptions.materialOptionsUrl;
  }

  @property({ type: String })
  public set noiseMaterialOptionsUrl(value: string) {
    this.noiseOptions = new CaveNoiseOptionsValue(
      value,
      this.noiseOptions.reloadIntervalMs,
      this.noiseOptions.materialOptions
    );
  }

  public get noiseMaterialReloadIntervalMs(): number {
    return this.noiseOptions.reloadIntervalMs;
  }

  @property({ type: Number })
  public set noiseMaterialReloadIntervalMs(value: number) {
    this.noiseOptions = new CaveNoiseOptionsValue(
      this.noiseOptions.materialOptionsUrl,
      value,
      this.noiseOptions.materialOptions
    );
  }

  public get noiseMaterialOptions(): CaveNoiseMaterialOptions {
    return this.noiseOptions.materialOptions;
  }

  @property({ attribute: false })
  public set noiseMaterialOptions(value: CaveNoiseMaterialOptions) {
    this.noiseOptions = new CaveNoiseOptionsValue(
      this.noiseOptions.materialOptionsUrl,
      this.noiseOptions.reloadIntervalMs,
      value
    );
  }

  protected override async firstUpdated(): Promise<void> {
    await this.#loadNoiseMaterialOptions();
    this.#propagateCaveReferenceToAllSlots();
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (changed.has('curveOptions')) {
      this.#curveGenerator = new GamePolygonGeneratorController(
        this,
        this.#curveOptionsPresetResolver.resolve(this.curveOptions.preset)
      );

      this.collisionReactiveController?.checkCollision();
      this.requestUpdate();
    }

    if (changed.has('scheduler')) {
      this.#unsubscribe?.();
      this.#unsubscribe = this.scheduler?.subscribe(this) ?? null;
    }

    if (changed.has('camera')) {
      this.#unsubscribeFromCamera?.();
      this.#unsubscribeFromCamera =
        this.camera?.subscribe(() => this.requestUpdate()) ?? null;
    }

    if (changed.has('collisionReactiveController')) {
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

  public observeGameObject(gameObject: CollisionObservedGameObject | null): void {
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
      throw new RangeError('Collision flash duration must be a finite number >= 50.');
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
    if (this.noiseOptions.reloadIntervalMs <= 0) {
      return;
    }

    if (time - this.#lastNoiseReloadAtMs < this.noiseOptions.reloadIntervalMs) {
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

  readonly #onOverlaySlotChange = (event: Event): void => {
    const slot = event.target as HTMLSlotElement | null;
    this.#propagateCaveReferenceToSlot({ slot });
  };

  #createOpenCollisionPolygon(
    points: readonly { readonly x: number; readonly y: number }[]
  ): CollisionPolygon | null {
    if (points.length < 2) {
      return null;
    }

    return CollisionPolygon.open(
      points.map(point => new CollisionVector2(point.x, point.y))
    );
  }

  #propagateCaveReferenceToAllSlots(): void {
    const startSlot = this.renderRoot.querySelector(
      'slot[name="overlay-start"]'
    ) as HTMLSlotElement | null;

    const centerSlot = this.renderRoot.querySelector(
      'slot[name="overlay-center"]'
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
      const cacheBustedUrl = `${this.noiseOptions.materialOptionsUrl}?t=${Date.now()}`;
      const response = await fetch(cacheBustedUrl, { cache: 'no-store' });

      if (!response.ok) {
        return;
      }

      const loaded = (await response.json()) as Partial<CaveNoiseMaterialOptions>;
      const materialOptions = this.#noiseMaterialMerger.merge(
        this.noiseOptions.materialOptions,
        loaded
      );

      this.noiseOptions = new CaveNoiseOptionsValue(
        this.noiseOptions.materialOptionsUrl,
        this.noiseOptions.reloadIntervalMs,
        materialOptions
      );
    } catch {
      // Keep current options if runtime JSON is missing or invalid.
    }
  }

  protected override render(): TemplateResult {
    const worldWidth = this.#canvasLength * 3;
    const worldHeight = 300;
    const cameraView = this.camera?.getView();
    const isMiniMap = this.viewportOptions.showCameraViewBox;

    const viewportWidth = this.viewportOptions.width ?? cameraView?.width ?? worldWidth;
    const viewportHeight =
      this.viewportOptions.height ?? cameraView?.height ?? worldHeight;

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
        showReferenceCurve: this.caveRenderOptions.showReferenceCurve,
        referenceCurveRenderStyle: this.caveRenderOptions.referenceCurveRenderStyle,
        closeCurvesToBounds: this.caveRenderOptions.closeUpperLowerToBounds,
        boundsWidth: worldWidth,
        boundsHeight: worldHeight,
      }
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
            .polygon=${shape as unknown as GamePolygon['polygon']}
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

        ${this.viewportOptions.showCameraViewBox && cameraView
          ? html`<div class="camera-viewbox" style=${cameraViewBoxStyle}></div>`
          : null}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cave-game-object': CaveGameObject;
  }
}
