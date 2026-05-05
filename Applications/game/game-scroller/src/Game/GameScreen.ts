// FILE: src/Game/GameScreen.ts

import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
 
import type { TimeSchdulerObserver } from './TimeSchdulerObserver.js';
import './GameCanvas.js';
import type { ICamera } from './ICamera.js';
import { Camera } from './Camera.js';

const GAME_SCREEN_VIEWPORT = {
  width: 320,
  height: 300
} as const;

const GAME_WORLD = {
  width: 1500,
  height: 300
} as const;

@customElement('game-screen')
export class GameScreen extends LitElement {
  readonly #camera: ICamera = new Camera({
    viewport: GAME_SCREEN_VIEWPORT,
    world: GAME_WORLD,
    sampleStep: 4
  });

  @property({ attribute: false })
  public scheduler?: TimeSchdulerObserver;

  protected override updated(changed: Map<string, unknown>): void {
    if (!changed.has('scheduler')) return;

    this.#camera.setScheduler(this.scheduler);
  }

  public override disconnectedCallback(): void {
    this.#camera.setScheduler(undefined);
    super.disconnectedCallback();
  }

  protected override render(): TemplateResult {
    return html`
      <game-canvas
        .scheduler=${this.scheduler}
        .camera=${this.#camera}
      ></game-canvas>

      <game-canvas
        .scheduler=${this.scheduler}
        .camera=${this.#camera}
        .viewportWidth=${300}
        .viewportHeight=${300}
        .showCameraViewBox=${true}
      ></game-canvas>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'game-screen': GameScreen;
  }
}
