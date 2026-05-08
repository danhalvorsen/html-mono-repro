import { css, html, LitElement, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '../GameObjects/CameraGameObject.js';
import '../GameObjects/CaveGameObject.js';

const WORLD_WIDTH = 1500;
const WORLD_HEIGHT = 300;
const CAMERA_WIDTH = 650;
const CAMERA_HEIGHT = 260;
const LOOK_AT_Y = 150;

@customElement('view-cave-object')
export class ViewCaveObject extends LitElement {
  public static override styles = css`
    :host {
      display: block;
    }

    .layout {
      display: grid;
      gap: 16px;
    }

    .panel {
      display: grid;
      gap: 8px;
      border: 1px solid #2a3042;
      border-radius: 12px;
      background: #121523;
      padding: 12px;
    }

    h2 {
      margin: 0;
      color: #bdc8f4;
      font-size: 16px;
    }

    p {
      margin: 0;
      color: #9fb0ea;
      font-size: 13px;
    }

    label {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 8px;
      color: #cbd5e1;
      font: 12px/1.2 system-ui, sans-serif;
    }

    input {
      grid-column: 1 / -1;
      width: 100%;
    }

    output {
      color: #93c5fd;
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    }

    .world-cave {
      width: 100%;
    }

    camera-game-object {
      width: ${CAMERA_WIDTH}px;
      height: ${CAMERA_HEIGHT}px;
      max-width: 100%;
      display: block;
    }

    .camera-world {
      position: relative;
      width: ${WORLD_WIDTH}px;
      height: ${WORLD_HEIGHT}px;
    }

    .camera-world cave-base-game-object {
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
      cursor: ew-resize;
      pointer-events: auto;
      touch-action: none;
      z-index: 20;
    }

    .target:active {
      background: #f97316;
      box-shadow: 0 0 0 6px rgba(249, 115, 22, 0.3);
    }

    .stats {
      color: #94a3b8;
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      font-size: 12px;
    }
  `;

  @state()
  private lookAtX = 250;

  @state()
  private isDragging = false;

  protected override render(): TemplateResult {
    return html`
      <section class="layout">
        <div class="panel">
          <h2>Cave Object</h2>
          <p>Existing cave object.</p>

          <cave-base-game-object class="world-cave"></cave-base-game-object>
        </div>

        <div class="panel">
          <h2>Camera View</h2>
          <p>
            This is what the camera sees. Drag the red marker horizontally to
            update lookAt.x.
          </p>

          <label>
            lookAt.x
            <output>${this.lookAtX}</output>
            <input
              type="range"
              min="0"
              max=${WORLD_WIDTH}
              step="1"
              .value=${String(this.lookAtX)}
              @input=${this.onLookAtInput}
            />
          </label>

          <camera-game-object
            .lookAt=${{ x: this.lookAtX, y: LOOK_AT_Y }}
            .fov=${{ width: CAMERA_WIDTH, height: CAMERA_HEIGHT }}
            .world=${{ width: WORLD_WIDTH, height: WORLD_HEIGHT }}
          >
            <div class="camera-world">
              <cave-base-game-object
                .showTriangleStrip=${true}
                .showCollisionPolygon=${true}
              ></cave-base-game-object>

              <div
                class="target"
                style=${`left:${this.lookAtX}px;top:${LOOK_AT_Y}px;`}
                @pointerdown=${this.onTargetPointerDown}
                @pointermove=${this.onTargetPointerMove}
                @pointerup=${this.onTargetPointerUp}
                @pointercancel=${this.onTargetPointerCancel}
              ></div>
            </div>
          </camera-game-object>

          <div class="stats">
            lookAt=(${this.lookAtX}, ${LOOK_AT_Y})
            dragging=${this.isDragging ? 'yes' : 'no'}
          </div>
        </div>
      </section>
    `;
  }

  private readonly onLookAtInput = (event: Event): void => {
    const target = event.target;

    if (!(target instanceof HTMLInputElement)) {
      throw new Error('Expected range input target.');
    }

    this.lookAtX = this.clampWorldX(Number(target.value));
  };

  private readonly onTargetPointerDown = (event: PointerEvent): void => {
    event.preventDefault();
    event.stopPropagation();

    this.isDragging = true;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.updateLookAtFromPointer(event);
  };

  private readonly onTargetPointerMove = (event: PointerEvent): void => {
    if (!this.isDragging) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.updateLookAtFromPointer(event);
  };

  private readonly onTargetPointerUp = (event: PointerEvent): void => {
    event.preventDefault();
    event.stopPropagation();

    this.isDragging = false;

    const target = event.currentTarget as HTMLElement;

    if (target.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }

    this.updateLookAtFromPointer(event);
  };

  private readonly onTargetPointerCancel = (event: PointerEvent): void => {
    event.preventDefault();
    event.stopPropagation();

    this.isDragging = false;

    const target = event.currentTarget as HTMLElement;

    if (target.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }
  };

  private updateLookAtFromPointer(event: PointerEvent): void {
    const camera = this.renderRoot.querySelector('camera-game-object') as
      | HTMLElement & { getView?: () => { x: number } }
      | null;

    if (camera === null || camera.getView === undefined) {
      throw new Error('camera-game-object with getView() was not found.');
    }

    const cameraBounds = camera.getBoundingClientRect();
    const view = camera.getView();

    const viewportX = event.clientX - cameraBounds.left;
    const worldX = view.x + viewportX;

    this.lookAtX = this.clampWorldX(Math.round(worldX));
  }

  private clampWorldX(value: number): number {
    if (!Number.isFinite(value)) {
      return 0;
    }

    return Math.min(WORLD_WIDTH, Math.max(0, value));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'view-cave-object': ViewCaveObject;
  }
}
