// FILE: src/Game/Srceens/Cave/CaveGameObject.ts

import { LitElement, css, html, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import type { ITimeObserver, TimeSchdulerObserver } from '../../ObjectObjectTimerObserver.js';
import { GamePolygon } from '../../GamePolygon.js';
import { GamePolygonGeneratorController } from './GamePolygonGeneratorController.js';
import type { Point2 } from '@monorepo/core-math';
import { MultiCurveSvgTemplate } from './MultiCurveSvgTemplate.js';
import type { ICamera } from '../../ICamera.js';

type CaveGameObjectReferenceTarget = HTMLElement & {
  caveGameObject?: CaveGameObject;
};

@customElement('cave-game-object')
export class CaveGameObject extends LitElement implements ITimeObserver {
  public static override styles = css`
    .camera-viewport {
      position: relative;
      overflow: hidden;
    }

    .cave-layout {
      position: relative;
      width: fit-content;
      transform-origin: left top;
      will-change: transform;
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
  #unsubscribe: (() => void) | null = null;
  #unsubscribeFromCamera: (() => void) | null = null;

  @property({ attribute: false })
  public scheduler?: TimeSchdulerObserver;

  @property({ attribute: false })
  public camera?: ICamera;

  @property({ type: Number })
  public viewportWidth?: number;

  @property({ type: Number })
  public viewportHeight?: number;

  @property({ type: Boolean })
  public showCameraViewBox = false;

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
    if (changed.has('scheduler')) {
      this.#unsubscribe?.();
      this.#unsubscribe = this.scheduler?.subscribe(this) ?? null;
    }

    if (changed.has('camera')) {
      this.#unsubscribeFromCamera?.();
      this.#unsubscribeFromCamera = this.camera?.subscribe(() => this.requestUpdate()) ?? null;
    }
  }

  public override disconnectedCallback(): void {
    this.#unsubscribe?.();
    this.#unsubscribe = null;

    this.#unsubscribeFromCamera?.();
    this.#unsubscribeFromCamera = null;

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

  readonly #onOverlaySlotChange = (event: Event): void => {
    const slot = event.target as HTMLSlotElement | null;
    this.#propagateCaveReferenceToSlot({ slot });
  };

  #propagateCaveReferenceToAllSlots(): void {
    const startSlot = this.renderRoot.querySelector('slot[name="overlay-start"]') as HTMLSlotElement | null;
    const centerSlot = this.renderRoot.querySelector('slot[name="overlay-center"]') as HTMLSlotElement | null;

    this.#propagateCaveReferenceToSlot({ slot: startSlot });
    this.#propagateCaveReferenceToSlot({ slot: centerSlot });
  }

  #propagateCaveReferenceToSlot(options: { readonly slot: HTMLSlotElement | null }): void {
    if (!options.slot) return;

    const assignedElements = options.slot.assignedElements({ flatten: true });

    for (const element of assignedElements) {
      if (!(element instanceof HTMLElement)) continue;
      (element as CaveGameObjectReferenceTarget).caveGameObject = this;
    }
  }

  protected override render(): TemplateResult {
    const worldWidth = this.#canvasLength * 3;
    const worldHeight = 300;
    const cameraView = this.camera?.getView();
    const isMiniMap = this.showCameraViewBox;
    const viewportWidth = this.viewportWidth ?? cameraView?.width ?? worldWidth;
    const viewportHeight = this.viewportHeight ?? cameraView?.height ?? worldHeight;
    const scale = isMiniMap ? Math.min(viewportWidth / worldWidth, viewportHeight / worldHeight) : 1;
    const scaledWorldWidth = worldWidth * scale;
    const scaledWorldHeight = worldHeight * scale;
    const offsetX = isMiniMap
      ? (viewportWidth - scaledWorldWidth) / 2
      : (cameraView ? -cameraView.x : 0);
    const offsetY = isMiniMap
      ? (viewportHeight - scaledWorldHeight) / 2
      : (cameraView ? -cameraView.y : 0);
    const transform = `translate3d(${offsetX}px, ${offsetY}px, 0) scale(${scale})`;
    const cameraViewBoxStyle = cameraView
      ? styleMap({
          left: `${offsetX + cameraView.x * scale}px`,
          top: `${offsetY + cameraView.y * scale}px`,
          width: `${cameraView.width * scale}px`,
          height: `${cameraView.height * scale}px`
        })
      : undefined;

    const shape = new MultiCurveSvgTemplate(
      this.#curveGenerator.referencePoints,
      this.#curveGenerator.upperPoints,
      this.#curveGenerator.lowerPoints
    );

    return html`
    
      <div
        class="camera-viewport"
        style=${styleMap({
          width: `${viewportWidth}px`,
          height: `${viewportHeight}px`
        })}
      >
        <div
          class="cave-layout"
          style=${styleMap({
            transform
          })}
        >
          <game-polygon
            .width=${worldWidth}
            .height=${worldHeight}
            .polygon=${shape as unknown as GamePolygon['polygon']}
          ></game-polygon>

          <div class="overlay-layer">
            <slot name="overlay-start" @slotchange=${this.#onOverlaySlotChange}></slot>
          </div>

          <div class="overlay-layer">
            <slot name="overlay-center" @slotchange=${this.#onOverlaySlotChange}></slot>
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
    'cave-game-object': CaveGameObject;
  }
}
