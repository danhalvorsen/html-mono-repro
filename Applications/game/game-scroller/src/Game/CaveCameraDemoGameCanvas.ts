import type { Point2 } from '@monorepo/core-math';
import { css, html, LitElement, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { Camera } from './Camera.js';
import type { ICamera, ICameraFollowTarget } from './ICamera.js';
import { TimeSchdulerObserver } from './TimeSchdulerObserver.js';
import '../GameObjects/CaveGameObject.js';

const WORLD_WIDTH = 1500;
const WORLD_HEIGHT = 300;
const MIN_VIEWPORT_WIDTH = 320;
const DEFAULT_VIEWPORT_WIDTH = 700;
const TARGET_Y = 150;

class MutableCameraFollowTarget implements ICameraFollowTarget {
  #point: Point2;

  public constructor(point: Point2) {
    this.#point = { x: point.x, y: point.y };
  }

  public setPoint(point: Point2): void {
    this.#point = { x: point.x, y: point.y };
  }

  public getCurrentPoint(): Point2 {
    return { x: this.#point.x, y: this.#point.y };
  }
}

@customElement('cave-camera-demo-game-canvas')
export class CaveCameraDemoGameCanvas extends LitElement {
  public static override styles = css`
    :host {
      display: block;
      width: 100%;
      color: #e5e7eb;
    }

    .panel {
      display: grid;
      gap: 10px;
      border: 1px solid #2a3042;
      border-radius: 12px;
      background: #121523;
      padding: 12px;
    }

    .toolbar {
      display: grid;
      grid-template-columns: minmax(180px, 1fr) auto;
      gap: 8px;
      align-items: center;
      color: #cbd5e1;
      font: 12px/1.2 system-ui, sans-serif;
    }

    input {
      width: 100%;
    }

    output {
      color: #93c5fd;
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    }

    .viewport {
      position: relative;
      overflow: hidden;
      border: 1px solid #334155;
      border-radius: 10px;
      background: #0f1118;
      height: ${WORLD_HEIGHT}px;
    }

    .world {
      position: relative;
      width: ${WORLD_WIDTH}px;
      height: ${WORLD_HEIGHT}px;
      will-change: transform;
    }

    cave-base-game-object {
      position: absolute;
      left: 0;
      top: 0;
      width: ${WORLD_WIDTH}px;
      height: ${WORLD_HEIGHT}px;
    }

    .target {
      position: absolute;
      width: 22px;
      height: 22px;
      border: 2px solid #f8fafc;
      border-radius: 999px;
      background: #ef4444;
      box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.25);
      transform: translate(-50%, -50%);
    }

    .crosshair {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .crosshair::before {
      content: "";
      position: absolute;
      left: 50%;
      top: 0;
      bottom: 0;
      border-left: 1px dashed rgba(248, 250, 252, 0.35);
    }

    .stats {
      color: #94a3b8;
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      font-size: 12px;
    }
  `;

  readonly #scheduler = new TimeSchdulerObserver();

  readonly #camera: ICamera = new Camera({
    viewport: {
      width: DEFAULT_VIEWPORT_WIDTH,
      height: WORLD_HEIGHT,
    },
    world: {
      width: WORLD_WIDTH,
      height: WORLD_HEIGHT,
    },
    sampleStep: 4,
  });

  readonly #target = new MutableCameraFollowTarget({
    x: 80,
    y: TARGET_Y,
  });

  #unsubscribeFromCamera: (() => void) | null = null;
  #resizeObserver: ResizeObserver | null = null;

  @state()
  private targetX = 80;

  @state()
  private viewportWidth = DEFAULT_VIEWPORT_WIDTH;

  public override connectedCallback(): void {
    super.connectedCallback();

    this.#camera.setScheduler(this.#scheduler);
    this.#camera.setFollowTarget(this.#target);

    this.#unsubscribeFromCamera = this.#camera.subscribe(() => {
      this.requestUpdate();
    });

    this.#scheduler.start();

    this.#resizeObserver = new ResizeObserver(() => {
      this.updateViewportWidth();
    });

    this.#resizeObserver.observe(this);

    queueMicrotask(() => this.updateViewportWidth());
  }

  public override disconnectedCallback(): void {
    this.#resizeObserver?.disconnect();
    this.#resizeObserver = null;

    this.#unsubscribeFromCamera?.();
    this.#unsubscribeFromCamera = null;

    this.#camera.setFollowTarget(undefined);
    this.#camera.setScheduler(undefined);
    this.#scheduler.stop();

    super.disconnectedCallback();
  }

  protected override render(): TemplateResult {
    const view = this.#camera.getView();

    return html`
      <section class="panel">
        <div class="toolbar">
          <label>
            camera target x
            <input
              type="range"
              min="0"
              max=${WORLD_WIDTH}
              step="1"
              .value=${String(this.targetX)}
              @input=${this.onTargetXInput}
            />
          </label>

          <output>${this.targetX}</output>
        </div>

        <div
          class="viewport"
          style=${styleMap({
            width: `${this.viewportWidth}px`,
          })}
        >
          <div
            class="world"
            style=${styleMap({
              transform: `translate3d(${-view.x}px, ${-view.y}px, 0)`,
            })}
          >
            <cave-base-game-object
              .showControls=${false}
              .showTriangleStrip=${true}
              .showCollisionPolygon=${true}
            ></cave-base-game-object>

            <div
              class="target"
              style=${styleMap({
                left: `${this.targetX}px`,
                top: `${TARGET_Y}px`,
              })}
            ></div>
          </div>

          <div class="crosshair"></div>
        </div>

        <div class="stats">
          viewport=${view.width}x${view.height}
          camera=(${Math.round(view.x)}, ${Math.round(view.y)})
          world=${WORLD_WIDTH}x${WORLD_HEIGHT}
        </div>
      </section>
    `;
  }

  private updateViewportWidth(): void {
    const measuredWidth = Math.round(this.getBoundingClientRect().width);
    const nextWidth = Math.max(
      MIN_VIEWPORT_WIDTH,
      Math.min(WORLD_WIDTH, measuredWidth || DEFAULT_VIEWPORT_WIDTH),
    );

    if (nextWidth === this.viewportWidth) {
      return;
    }

    this.viewportWidth = nextWidth;
    this.#camera.setViewport({
      width: nextWidth,
      height: WORLD_HEIGHT,
    });
  }

  private readonly onTargetXInput = (event: Event): void => {
    const target = event.target;

    if (!(target instanceof HTMLInputElement)) {
      throw new Error('Expected range input target.');
    }

    this.targetX = Number(target.value);
    this.#target.setPoint({
      x: this.targetX,
      y: TARGET_Y,
    });

    this.#camera.setFollowTarget(this.#target);
    this.requestUpdate();
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'cave-camera-demo-game-canvas': CaveCameraDemoGameCanvas;
  }
}
