import type { IParametricMotion } from "@monorepo/game-motion";
import { SceneGraph, SceneNode } from "@monorepo/core-scene-graph";
import { html, LitElement, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import type { ICamera, ICameraFollowTarget } from "./ICamera.js";
import { GameObjectPlacementFactory } from "./GameObjectPlacementFactory.js";
import type { TimeSchdulerObserver } from "./TimeSchdulerObserver.js";
import "./Screen/Cave/CaveGameObject.js";
import { RectangleGameObject } from "../GameObjects/RectangleGameObjects.js";
import { RocketGameObject } from "../GameObjects/RocketGameObject.js";

export type GameObjectSlot = "overlay-start" | "overlay-center";

export interface BaseGameObjectViewModel {
  readonly id: string;
  readonly slot: GameObjectSlot;
  readonly fill: string;
  readonly stroke: string;
  readonly size: number;
  readonly followCamera: boolean;
}

export interface RectangleGameObjectViewModel extends BaseGameObjectViewModel {
  readonly kind: "rectangle";
  readonly indexOffsetRatio: number;
}

export interface RocketGameObjectViewModel extends BaseGameObjectViewModel {
  readonly kind: "rocket";
  readonly motion: IParametricMotion;
}

export type GameObjectViewModel =
  | RectangleGameObjectViewModel
  | RocketGameObjectViewModel;

const placementFactory = new GameObjectPlacementFactory();

@customElement("game-canvas")
export class GameCanvas extends LitElement {
  private readonly sceneRoot = new SceneNode("game-canvas-root");
  private readonly scene = new SceneGraph(this.sceneRoot);
  readonly #sceneAttachedObjects = new WeakSet<RectangleGameObject | RocketGameObject>();

  #isCameraTargetBound = false;

  @property({ attribute: false })
  public gameObjects: readonly GameObjectViewModel[] = placementFactory.create();

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

    if (changed.has("gameObjects")) {
      this.#isCameraTargetBound = false;
    }

    if (this.showCameraViewBox) return;
    if (!this.camera) return;
    if (
      !changed.has("camera") &&
      !changed.has("gameObjects") &&
      this.#isCameraTargetBound
    ) {
      return;
    }

    const target = this.renderRoot.querySelector(
      '[data-camera-target="true"]',
    ) as ICameraFollowTarget | null;

    if (!target) return;

    this.camera.setFollowTarget(target);
    this.#isCameraTargetBound = true;
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
          (gameObject) => gameObject.id,
          (gameObject) => this.#renderGameObject(gameObject),
        )}
      </cave-game-object>
    `;
  }

  #renderGameObject(gameObject: GameObjectViewModel): TemplateResult {
    switch (gameObject.kind) {
      case "rectangle":
        return html`
          <rectangle-game-object
            slot=${gameObject.slot}
            data-camera-target=${gameObject.followCamera ? "true" : "false"}
            .scheduler=${this.scheduler}
            .fill=${gameObject.fill}
            .stroke=${gameObject.stroke}
            .size=${gameObject.size}
            .indexOffsetRatio=${gameObject.indexOffsetRatio}
          ></rectangle-game-object>
        `;

      case "rocket":
        return html`
          <rocket-game-object
            slot=${gameObject.slot}
            data-camera-target=${gameObject.followCamera ? "true" : "false"}
            .scheduler=${this.scheduler}
            .motion=${gameObject.motion}
            .fill=${gameObject.fill}
            .stroke=${gameObject.stroke}
            .size=${gameObject.size}
          ></rocket-game-object>
        `;
    }
  }

  #attachRenderedObjectsToScene(): void {
    const objects = this.renderRoot.querySelectorAll(
      "rectangle-game-object, rocket-game-object",
    );

    for (const object of objects) {
      if (
        !(object instanceof RectangleGameObject) &&
        !(object instanceof RocketGameObject)
      ) {
        continue;
      }

      if (this.#sceneAttachedObjects.has(object)) {
        continue;
      }

      this.scene.add(object);
      this.#sceneAttachedObjects.add(object);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "game-canvas": GameCanvas;
  }
}
