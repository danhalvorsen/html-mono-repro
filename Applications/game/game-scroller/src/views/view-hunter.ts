import { css, html, LitElement, type TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { Vector2 } from "@monorepo/core-math";
import { TimeSchdulerObserver } from "@monorepo/game-design-patterns";
import {
  MousePointerGameObject,
  RocketLauncherGameObject,
} from "@monorepo/game-objects";

@customElement("mouse-pointer-game-object")
class MousePointerViewGameObject extends MousePointerGameObject {}

@customElement("view-hunter")
export class ViewHunter extends LitElement {
  private static readonly MOUSE_SIZE = 30;
  private static readonly SCANNER_SIZE = 36;

  public static override styles = css`
    :host {
      display: block;
    }

    .panel {
      border: 1px solid #2a3042;
      border-radius: 12px;
      background: #121523;
      padding: 14px;
    }

    h2 {
      margin: 0 0 8px 0;
      font-size: 16px;
      color: #bdc8f4;
    }

    p {
      margin: 0 0 12px 0;
      color: #9fb0ea;
      font-size: 13px;
    }

    .hint {
      margin-top: 12px;
      color: #94a3b8;
      font-size: 12px;
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    }

    .controls {
      display: grid;
      gap: 10px;
      margin: 0 0 12px 0;
    }

    label {
      display: grid;
      gap: 4px;
      color: #cbd5e1;
      font-size: 12px;
    }

    .surface {
      position: relative;
      width: 100%;
      height: 320px;
      border-radius: 10px;
      border: 1px solid #334155;
      background:
        linear-gradient(90deg, rgba(30, 41, 59, 0.25) 1px, transparent 1px) 0 0 / 24px 24px,
        linear-gradient(rgba(30, 41, 59, 0.25) 1px, transparent 1px) 0 0 / 24px 24px,
        radial-gradient(circle at 25% 20%, #f8fafc 0%, #e2e8f0 35%, #cbd5e1 100%);
      overflow: hidden;
    }

    .surface > mouse-pointer-game-object,
    .surface > .scanner-game-object {
      position: absolute;
      inset: 0;
      display: block;
    }

    mouse-pointer-game-object {
      --shape-fill: #f97316;
    }

    .scanner-game-object {
      --shape-fill: #10b981;
    }
  `;

  private readonly scheduler = new TimeSchdulerObserver();
  private resizeObserver: ResizeObserver | null = null;
  private mousePointer: MousePointerViewGameObject | null = null;
  private scannerObject: RocketLauncherGameObject | null = null;

  @state()
  private surfaceWidth = 800;

  @state()
  private surfaceHeight = 320;

  @state()
  private triggerDistance = 140;

  @state()
  private particleLifeTimeSeconds = 1.8;

  @state()
  private particleVelX = 0;

  @state()
  private particleVelY = -120;

  @state()
  private particleAccelerationScale = 1;

  public override connectedCallback(): void {
    super.connectedCallback();
    this.scheduler.start();
  }

  protected override firstUpdated(): void {
    const surface = this.renderRoot.querySelector<HTMLElement>(".surface");
    const mousePointer =
      this.renderRoot.querySelector<MousePointerViewGameObject>("mouse-pointer-game-object");

    if (surface === null || mousePointer === null) {
      return;
    }

    this.mousePointer = mousePointer;
    this.mousePointer.trackWindowPointer = false;
    this.updateSurfaceSize(surface);
    this.resizeObserver = new ResizeObserver(() => this.updateSurfaceSize(surface));
    this.resizeObserver.observe(surface);

    this.rebuildScanner();

    mousePointer.setPosistion(new Vector2(80, 80));
    this.updateScannerCenter();
  }

  public override disconnectedCallback(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;

    if (this.scannerObject !== null) {
      this.scannerObject.remove();
      this.scannerObject = null;
    }

    this.mousePointer = null;
    this.scheduler.stop();
    super.disconnectedCallback();
  }

  private readonly onSurfacePointerMove = (event: PointerEvent): void => {
    const surface = event.currentTarget;

    if (!(surface instanceof HTMLElement) || this.mousePointer === null) {
      return;
    }

    const bounds = surface.getBoundingClientRect();
    const x = this.clamp(event.clientX - bounds.left, 0, bounds.width);
    const y = this.clamp(event.clientY - bounds.top, 0, bounds.height);

    this.mousePointer.setPosistion(new Vector2(x, y));
  };

  private updateSurfaceSize(surface: HTMLElement): void {
    const width = Math.max(1, Math.round(surface.clientWidth));
    const height = Math.max(1, Math.round(surface.clientHeight));
    this.surfaceWidth = width;
    this.surfaceHeight = height;

    if (this.scannerObject !== null) {
      this.scannerObject.options = {
        width: this.surfaceWidth,
        height: this.surfaceHeight,
        rotationRadians: 0,
      };
    }

    if (this.mousePointer !== null) {
      this.mousePointer.options = {
        width: this.surfaceWidth,
        height: this.surfaceHeight,
        rotationRadians: 0,
      };
    }

    this.updateScannerCenter();
  }

  private rebuildScanner(): void {
    const surface = this.renderRoot.querySelector<HTMLElement>(".surface");
    const mousePointer = this.mousePointer;
    if (surface === null || mousePointer === null) {
      return;
    }

    this.scannerObject?.remove();

    this.scannerObject = new RocketLauncherGameObject();
    this.scannerObject.mouseGameObject = mousePointer;
    this.scannerObject.detectionRadius = this.triggerDistance;
    this.scannerObject.lifetimeSeconds = this.particleLifeTimeSeconds;
    this.scannerObject.initialSpeed = Math.hypot(this.particleVelX, this.particleVelY);
    this.scannerObject.accelerationMagnitude = Math.max(
      0,
      this.particleAccelerationScale * 80,
    );

    this.scannerObject.classList.add("scanner-game-object");
    this.scannerObject.scheduler = this.scheduler;
    this.scannerObject.options = {
      width: this.surfaceWidth,
      height: this.surfaceHeight,
      rotationRadians: 0,
    };
    this.scannerObject.size = ViewHunter.SCANNER_SIZE;
    this.scannerObject.fill = "#10b981";
    this.scannerObject.stroke = "#064e3b";
    surface.appendChild(this.scannerObject);
    this.updateScannerCenter();
  }

  private readonly onTriggerDistanceInput = (event: Event): void => {
    const input = event.currentTarget;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }

    this.triggerDistance = Number(input.value);
    this.rebuildScanner();
  };

  private readonly onParticleLifeInput = (event: Event): void => {
    const input = event.currentTarget;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }

    this.particleLifeTimeSeconds = Number(input.value);
    this.rebuildScanner();
  };

  private readonly onParticleVelXInput = (event: Event): void => {
    const input = event.currentTarget;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }

    this.particleVelX = Number(input.value);
    this.rebuildScanner();
  };

  private readonly onParticleVelYInput = (event: Event): void => {
    const input = event.currentTarget;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }

    this.particleVelY = Number(input.value);
    this.rebuildScanner();
  };

  private readonly onParticleAccelerationScaleInput = (event: Event): void => {
    const input = event.currentTarget;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }

    this.particleAccelerationScale = Number(input.value);
    this.rebuildScanner();
  };

  private updateScannerCenter(): void {
    if (this.scannerObject === null) {
      return;
    }

    const bottomPadding = 12;
    this.scannerObject.setPosistion(
      new Vector2(
        this.surfaceWidth / 2,
        this.surfaceHeight - ViewHunter.SCANNER_SIZE / 2 - bottomPadding,
      ),
    );
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }

  protected override render(): TemplateResult {
    return html`
      <section class="panel">
        <h2>Hunter</h2>
        <p>
          Prototype tracker demo: the orange pointer follows your mouse, and the
          green scanner emits an ellipse toward the pointer when inside trigger distance.
        </p>

        <div class="controls">
          <label>
            Trigger Distance: ${this.triggerDistance}px
            <input
              type="range"
              min="20"
              max="320"
              step="1"
              .value=${String(this.triggerDistance)}
              @input=${this.onTriggerDistanceInput}
            />
          </label>
          <label>
            Particle Alive Time: ${this.particleLifeTimeSeconds.toFixed(1)}s
            <input
              type="range"
              min="0.2"
              max="10"
              step="0.1"
              .value=${String(this.particleLifeTimeSeconds)}
              @input=${this.onParticleLifeInput}
            />
          </label>
          <label>
            VelX: ${this.particleVelX.toFixed(0)}
            <input
              type="range"
              min="-600"
              max="600"
              step="10"
              .value=${String(this.particleVelX)}
              @input=${this.onParticleVelXInput}
            />
          </label>
          <label>
            VelY: ${this.particleVelY.toFixed(0)}
            <input
              type="range"
              min="-600"
              max="600"
              step="10"
              .value=${String(this.particleVelY)}
              @input=${this.onParticleVelYInput}
            />
          </label>
          <label>
            Particle Acceleration: ${this.particleAccelerationScale.toFixed(2)}x
            <input
              type="range"
              min="0"
              max="3"
              step="0.05"
              .value=${String(this.particleAccelerationScale)}
              @input=${this.onParticleAccelerationScaleInput}
            />
          </label>
        </div>

        <div class="surface" @pointermove=${this.onSurfacePointerMove}>
          <mouse-pointer-game-object
            .scheduler=${this.scheduler}
            .options=${{
              width: this.surfaceWidth,
              height: this.surfaceHeight,
              rotationRadians: 0,
            }}
            .positionX=${80}
            .positionY=${80}
            .size=${ViewHunter.MOUSE_SIZE}
            .fill=${"#f97316"}
            .stroke=${"#7c2d12"}
          ></mouse-pointer-game-object>
        </div>

        <div class="hint">
          triggerDistance=${this.triggerDistance}px, particleLife=${this.particleLifeTimeSeconds.toFixed(1)}s, velocity=(${this.particleVelX.toFixed(0)}, ${this.particleVelY.toFixed(0)}), accel=${this.particleAccelerationScale.toFixed(2)}x
        </div>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "mouse-pointer-game-object": MousePointerViewGameObject;
    "view-hunter": ViewHunter;
  }
}
