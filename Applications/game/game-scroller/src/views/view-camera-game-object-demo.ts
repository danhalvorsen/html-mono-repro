import { css, html, LitElement, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import type { CameraGameObject } from '@monorepo/game-objects';
import '@monorepo/game-objects';

const WORLD_WIDTH = 1500;
const WORLD_HEIGHT = 300;
const CAMERA_WIDTH = 650;
const CAMERA_HEIGHT = 260;
const LOOK_AT_Y = 150;

@customElement('view-camera-game-object-demo')
export class ViewCameraGameObjectDemo extends LitElement {
  public static override styles = css`
    :host {
      display: block;
    }

    .layout {
      display: grid;
      gap: 12px;
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

    camera-game-object {
      width: ${CAMERA_WIDTH}px;
      height: ${CAMERA_HEIGHT}px;
      max-width: 100%;
      touch-action: none;
    }

    cave-base-game-object {
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
          <h2>CameraGameObject Demo</h2>
          <p>
            Drag the red marker horizontally. The marker updates lookAt.x, and
            the camera slot moves to keep that point in view.
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
            .fov=${{ width: CAMERA_WIDTH, height: CAMERA_HEIGHT/2 }}
            .world=${{ width: WORLD_WIDTH, height: WORLD_HEIGHT }}
          >
            <cave-base-game-object
              .showControls=${false}
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
    const camera = this.getCameraGameObject();
    const cameraBounds = camera.getBoundingClientRect();
    const view = camera.getView();

    const viewportX = event.clientX - cameraBounds.left;
    const worldX = view.x + viewportX;

    this.lookAtX = this.clampWorldX(Math.round(worldX));
  }

  private getCameraGameObject(): CameraGameObject {
    const camera =
      this.renderRoot.querySelector<CameraGameObject>('camera-game-object');

    if (camera === null) {
      throw new Error('camera-game-object was not found.');
    }

    return camera;
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
    'view-camera-game-object-demo': ViewCameraGameObjectDemo;
  }
}
