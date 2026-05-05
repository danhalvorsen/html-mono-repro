// FILE: src/Game/Camera/Camera.ts

import type { Point2 } from '@monorepo/core-math';
import { html, LitElement, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
 
import type { CameraObserver, ICamera, ICameraFollowTarget, ICameraSize, ICameraView } from './ICamera.js';
import type { TimeSchdulerObserver } from './index.js';

export interface ICameraOptions {
  readonly viewport: ICameraSize;
  readonly world: ICameraSize;
  readonly sampleStep?: number;
}

@customElement('game-camera')
export class Camera extends LitElement implements ICamera {
  readonly #observers = new Set<CameraObserver>();

  #unsubscribeFromScheduler: (() => void) | null = null;

  #viewport: ICameraSize;
  #world: ICameraSize;
  #position: Point2 = { x: 0, y: 0 };
  #followTarget: ICameraFollowTarget | null = null;

  public constructor(options: ICameraOptions) {
    super();

    this.#viewport = sanitizeSize(options.viewport);
    this.#world = sanitizeSize(options.world);
    void options.sampleStep;
  }

  public get position(): Point2 {
    return copyPoint(this.#position);
  }

  public get viewport(): ICameraSize {
    return copySize(this.#viewport);
  }

  public get world(): ICameraSize {
    return copySize(this.#world);
  }

  public getView(): ICameraView {
    return {
      x: this.#position.x,
      y: this.#position.y,
      width: this.#viewport.width,
      height: this.#viewport.height
    };
  }

  public getViewBox(): string {
    const view = this.getView();
    return `${view.x} ${view.y} ${view.width} ${view.height}`;
  }

  public setScheduler(scheduler?: TimeSchdulerObserver): void {
    this.#unsubscribeFromScheduler?.();
    this.#unsubscribeFromScheduler = null;
    this.#unsubscribeFromScheduler = scheduler?.subscribe(this) ?? null;
  }

  public setViewport(viewport: ICameraSize): void {
    this.#viewport = sanitizeSize(viewport);
  }

  public setWorld(world: ICameraSize): void {
    this.#world = sanitizeSize(world);
  }

  public subscribe(observer: CameraObserver): () => void {
    this.#observers.add(observer);
    return () => {
      this.#observers.delete(observer);
    };
  }

  public setFollowTarget(target?: ICameraFollowTarget): void {
    this.#followTarget = target ?? null;
    this.#centerOnFollowTarget();
  }

  public onTime(time: number): void {
    void time;
    this.#centerOnFollowTarget();
  }

  public getPosistion(): Point2 {
    return this.position;
  }

  public getWorldPosistion(): Point2 {
    return this.position;
  }

  public getRotation(): Point2 {
    return { x: 0, y: 0 };
  }

  public getWorldRotation(): Point2 {
    return { x: 0, y: 0 };
  }

  public override disconnectedCallback(): void {
    this.setScheduler(undefined);
    super.disconnectedCallback();
  }

  protected override render(): TemplateResult {
    return html``;
  }

  #centerOnFollowTarget(): void {
    const point = this.#followTarget?.getCurrentPoint();
    if (!point) return;
    this.#setPosition({
      x: point.x - this.#viewport.width / 2,
      y: point.y - this.#viewport.height / 2
    });
  }

  #setPosition(position: Point2): void {
    const next = this.#clampPosition(position);

    if (next.x === this.#position.x && next.y === this.#position.y) return;

    this.#position = next;
    this.#notifyObservers();
  }

  #clampPosition(position: Point2): Point2 {
    return {
      x: clamp(position.x, 0, Math.max(0, this.#world.width - this.#viewport.width)),
      y: clamp(position.y, 0, Math.max(0, this.#world.height - this.#viewport.height))
    };
  }

  #notifyObservers(): void {
    for (const observer of this.#observers) {
      observer(this);
    }
  }
}

function sanitizeSize(size: ICameraSize): ICameraSize {
  return {
    width: sanitizePositiveNumber(size.width, 1),
    height: sanitizePositiveNumber(size.height, 1)
  };
}

function sanitizePositiveNumber(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function copyPoint(point: Point2): Point2 {
  return { x: point.x, y: point.y };
}

function copySize(size: ICameraSize): ICameraSize {
  return { width: size.width, height: size.height };
}

declare global {
  interface HTMLElementTagNameMap {
    'game-camera': Camera;
  }
}
