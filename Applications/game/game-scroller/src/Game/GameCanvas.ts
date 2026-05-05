// FILE: src/Game/GameCanvas.ts

import { html, LitElement, type TemplateResult } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { customElement, property } from 'lit/decorators.js';
 
import type { TimeSchdulerObserver } from './TimeSchdulerObserver.js';

import './Srceens/Cave/CaveGameObject.js';
import { RectangleGameObject } from '../GameObjects/RectangleGameObjects.js';
import type { ICamera, ICameraFollowTarget } from './ICamera.js';
import { GameObjectPlacementFactory } from './GameObjectPlacementFactory.js';
import { SceneGraph, SceneNode } from '@monorepo/core-scene-graph'; 

export type GameObjectViewModel = {
  readonly id: string;
  readonly slot: 'overlay-start' | 'overlay-center';
  readonly fill: string;
  readonly stroke: string;
  readonly size: number;
  readonly indexOffsetRatio: number;
  readonly followCamera: boolean;
};

const placementFactory = new GameObjectPlacementFactory();

@customElement('game-canvas')
export class GameCanvas extends LitElement {
  private readonly gameObjects = placementFactory.create();
  private readonly sceneRoot = new SceneNode('game-canvas-root');
  private readonly scene = new SceneGraph(this.sceneRoot);
  readonly #sceneAttachedObjects = new WeakSet<RectangleGameObject>();
  #isCameraTargetBound = false;

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

  protected override willUpdate(): void {
    this.scene.update();
  }

  protected override updated(changed: Map<string, unknown>): void {
    this.#attachRenderedObjectsToScene();
    this.scene.update();

    if (this.showCameraViewBox) return;
    if (!this.camera) return;
    if (!changed.has('camera') && this.#isCameraTargetBound) return;

    const target = this.renderRoot.querySelector('rectangle-game-object[data-camera-target="true"]') as ICameraFollowTarget | null;
    if (!target) return;

    this.camera.setFollowTarget(target);
    this.#isCameraTargetBound = true;
  }

  #attachRenderedObjectsToScene(): void {
    const objects = this.renderRoot.querySelectorAll('rectangle-game-object');
    for (const object of objects) {
      if (!(object instanceof RectangleGameObject)) continue;
      if (this.#sceneAttachedObjects.has(object)) continue;
      this.scene.add(object);
      this.#sceneAttachedObjects.add(object);
    }
  }

  protected override render(): TemplateResult {
    return html`
      <cave-game-object
        .scheduler=${this.scheduler}
        .camera=${this.camera}
        .viewportWidth=${this.viewportWidth}
        .viewportHeight=${this.viewportHeight}
        .showCameraViewBox=${this.showCameraViewBox}
        .showReferenceCurve=${false}
      >
        ${repeat(
          this.gameObjects,
          gameObject => gameObject.id,
          gameObject => html`
            <rectangle-game-object
              slot=${gameObject.slot}
              data-camera-target=${gameObject.followCamera ? 'true' : 'false'}
              .scheduler=${this.scheduler}
              .fill=${gameObject.fill}
              .stroke=${gameObject.stroke}
              .size=${gameObject.size}
              .indexOffsetRatio=${gameObject.indexOffsetRatio}
            ></rectangle-game-object>
          `
        )}
      </cave-game-object>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'game-canvas': GameCanvas;
  }
}
