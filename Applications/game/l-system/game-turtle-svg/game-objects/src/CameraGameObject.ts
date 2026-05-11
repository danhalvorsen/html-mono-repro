import { css, html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

export interface CameraLookAt {
  readonly x: number;
  readonly y: number;
}

export interface CameraSize {
  readonly width: number;
  readonly height: number;
}

export interface CameraView {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

@customElement('camera-game-object')
export class CameraGameObject extends LitElement {
  public static override styles = css`
    :host {
      display: block;
      position: relative;
      overflow: hidden;
      border: 1px solid #334155;
      border-radius: 10px;
      background: #0f1118;
      pointer-events: auto;
      touch-action: none;
    }

    .viewport {
      position: relative;
      overflow: hidden;
      width: 100%;
      height: 100%;
      pointer-events: auto;
      touch-action: none;
    }

    .world {
      position: relative;
      transform-origin: left top;
      will-change: transform;
      pointer-events: auto;
      touch-action: none;
    }

    .camera-center {
      position: absolute;
      left: 50%;
      top: 0;
      bottom: 0;
      border-left: 1px dashed rgba(248, 250, 252, 0.35);
      pointer-events: none;
    }

    ::slotted(*) {
      position: absolute;
      left: 0;
      top: 0;
    }
  `;

  @property({ attribute: false })
  public lookAt: CameraLookAt = { x: 0, y: 0 };

  @property({ attribute: false })
  public fov: CameraSize = { width: 500, height: 300 };

  @property({ attribute: false })
  public world: CameraSize = { width: 1500, height: 300 };

  @property({ type: Boolean, attribute: 'show-center-line' })
  public showCenterLine = true;

  protected override render(): TemplateResult {
    const view = this.getView();

    return html`
      <div
        class="viewport"
        style=${styleMap({
          width: `${view.width}px`,
          height: `${view.height}px`,
        })}
      >
        <div
          class="world"
          style=${styleMap({
            width: `${this.world.width}px`,
            height: `${this.world.height}px`,
            transform: `translate3d(${-view.x}px, ${-view.y}px, 0)`,
          })}
        >
          <slot></slot>
        </div>

        ${this.showCenterLine ? html`<div class="camera-center"></div>` : null}
      </div>
    `;
  }

  public setLookAt(lookAt: CameraLookAt): void {
    this.lookAt = {
      x: lookAt.x,
      y: lookAt.y,
    };
  }

  public getView(): CameraView {
    const width = this.resolvePositive(this.fov.width, 1);
    const height = this.resolvePositive(this.fov.height, 1);
    const worldWidth = this.resolvePositive(this.world.width, width);
    const worldHeight = this.resolvePositive(this.world.height, height);

    return {
      x: this.clamp(
        this.lookAt.x - width / 2,
        0,
        Math.max(0, worldWidth - width),
      ),
      y: this.clamp(
        this.lookAt.y - height / 2,
        0,
        Math.max(0, worldHeight - height),
      ),
      width,
      height,
    };
  }

  private resolvePositive(value: number, fallback: number): number {
    return Number.isFinite(value) && value > 0 ? value : fallback;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'camera-game-object': CameraGameObject;
  }
}
