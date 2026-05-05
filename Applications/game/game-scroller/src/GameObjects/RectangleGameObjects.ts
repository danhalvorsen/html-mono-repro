import type { Point2 } from '@monorepo/core-math';
import { customElement } from 'lit/decorators.js';
import { html, type TemplateResult } from 'lit';
import { SceneNode } from '@monorepo/core-scene-graph';
import { GameObjectSubject } from '../Game/GameObjectSubject.js';

export type Vector2 = Point2;

@customElement('rectangle-game-object')
export class RectangleGameObject extends GameObjectSubject {
  readonly #parentNode = new SceneNode('rectangle-parent');
  readonly #childNode = new SceneNode('rectangle-child');
  public childMode = false;
  #childObject: RectangleGameObject | null = null;
  #childTranslation: Point2 = { x: 0, y: 0 };
  #childRotationRadians = 0;

  public constructor() {
    super();
    this.#parentNode.add(this.#childNode);
    this.#childNode.translate(16, -16);
  }

  public getPosistion(): Vector2 {
    return this.getCurrentPoint() ?? { x: 0, y: 0 };
  }

  public override onTime(time: number): void {
    super.onTime(time);
    if (this.childMode) return;
    this.#updateChildWithSceneGraph();
  }

  protected override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (this.childMode) return;
    this.#ensureChildObject();
    if (changed.has('size') && this.#childObject) {
      this.#childObject.size = Math.max(4, this.size * 0.5);
    }
    this.#updateChildWithSceneGraph();
  }

  protected override render(): TemplateResult {
    if (this.childMode) {
      return super.render();
    }

    return html`
      <div style="position: relative; width: 1500px; height: 300px;">
        ${super.render()}
        <div
          style=${`position: absolute; inset: 0; transform: translate(${this.#childTranslation.x - 20}px, ${this.#childTranslation.y - 20}px) rotate(${this.#childRotationRadians}rad); transform-origin: 20px 20px;`}
        >
          ${this.#childObject ?? null}
        </div>
      </div>
    `;
  }

  #ensureChildObject(): void {
    if (this.#childObject) return;
    const child = document.createElement('rectangle-game-object') as RectangleGameObject;
    child.childMode = true;
    child.size = Math.max(4, this.size * 0.5);
    child.fill = '#1e3a8a';
    child.stroke = '#93c5fd';
    this.#childObject = child;
  }

  #updateChildWithSceneGraph(): void {
    this.#parentNode.setLocal(this.local);
    this.#parentNode.updateWorld();
    const childWorld = this.#childNode.world.toFloat32Array();
    this.#childTranslation = this.#extractTranslation(this.#childNode.world);
    this.#childRotationRadians = Math.atan2(childWorld[3] ?? 0, childWorld[0] ?? 1);
  }

  #extractTranslation(world: { toFloat32Array(): Float32Array }): Point2 {
    const values = world.toFloat32Array();
    return { x: values[2] ?? 0, y: values[5] ?? 0 };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rectangle-game-object': RectangleGameObject;
  }
}
