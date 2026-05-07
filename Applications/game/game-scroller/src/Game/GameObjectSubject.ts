import { Vector2 } from "@monorepo/core-math";
import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { TimeSchdulerObserver } from './TimeSchdulerObserver';
import { SvgRectangleBuilder } from './Elements/Polygon/SvgPolygonBuilder';
import { Matrix, type IMatrix, type Point, type Point2 } from '@monorepo/core-math';
import { GameObjectAnimationController } from './Animation/GameObjectAnimationController';
import type { ISceneNode } from '../../../../../packages/core-scene-graph/dist/ISceneNode';
//import type { ICaveGameObjectReference } from './Screen/Cave/ICaveGameObjectReference';
import type { PlayerInputController } from './Input';
import { TypedSubject, type Observer } from '@monorepo/core-design-patterns';

export interface IGameObjectSubject {
  onTime(time: number): void;
  getPosistion(): Vector2;
  setPosistion(position: Vector2): void;
  getWorldPosistion(): Vector2;
  getRotation(): Vector2;
  getWorldRotation(): Vector2;
}

export type GameObjectSubjectEvents = {
  positionChanged: Vector2;
  rotationChanged: Vector2;
  timeAdvanced: number;
};

export interface IGameObjectObservableSubject {
  subscribeState<K extends keyof GameObjectSubjectEvents>(
    eventName: K,
    observer: Observer<GameObjectSubjectEvents, K>
  ): () => void;
  unsubscribeState<K extends keyof GameObjectSubjectEvents>(
    eventName: K,
    observer: Observer<GameObjectSubjectEvents, K>
  ): boolean;
}

export interface ICollisionMovementConstraintTarget {
  acceptCurrentPosition(): void;
  rejectCurrentPosition(): void;
}

type GameObjectMotionState = {
  readonly position: Point2;
  readonly rotationRadians: number;
};

@customElement('game-object-subject')
export class GameObjectSubject
  extends LitElement
  implements IGameObjectSubject, IGameObjectObservableSubject, ICollisionMovementConstraintTarget, ISceneNode
{
  #unsubscribeFromScheduler: (() => void) | null = null;
  readonly #canvasWidth = 1500;
  readonly #canvasHeight = 300;
  readonly #stateSubject = new TypedSubject<GameObjectSubjectEvents>();

  @property({ attribute: false })
 
  @property({ attribute: false })
  scheduler?: TimeSchdulerObserver;

  @property({ type: Number })
  size = 10;

  @property({ type: Number })
  positionX = 20;
  
  @property({ type: Number })
  positionY = 20;

  @property({ type: String })
  fill = '#60a5fa';

  @property({ type: String })
  stroke = '#1d4ed8';

  @property({ type: Number })
  indexOffsetRatio = 0;

  @property({ attribute: false })
  controller?: PlayerInputController;

  private subject: TemplateResult;
  readonly #animationController: GameObjectAnimationController;
  #currentRotationRadians = 0;
  #lastAcceptedMotionState: GameObjectMotionState = {
    position: { x: this.positionX, y: this.positionY },
    rotationRadians: 0
  };
  #lastTimeMs: number | null = null;
  readonly #manualMoveSpeedPerSecond = 180;

  public constructor(subject?: TemplateResult) {
    super();
    this.subject = subject ?? this.#buildSubjectAt({ x: this.positionX, y: this.positionY }, 0);
    this.#animationController = new GameObjectAnimationController({
      host: this,
      indexOffsetRatio: this.indexOffsetRatio,
      onFrame: ({ point, rotationRadians }) => {
        this.positionX = point.x;
        this.positionY = point.y;
        this.#currentRotationRadians = rotationRadians;
        this.#applyTransformAndGeometry(
          { x: this.positionX, y: this.positionY },
          this.#currentRotationRadians
        );
        this.#stateSubject.notify('positionChanged', this.getPosistion());
        this.#stateSubject.notify('rotationChanged', this.getRotation());
      }
    });
  }
  
  public local: IMatrix = Matrix.identity(3);
  public world: IMatrix = Matrix.identity(3);
  public name = 'game-object-subject';

  public updateWorld(parent?: IMatrix): void {
    this.world = parent ? parent.multiply(this.local) : this.local;
  }

  public operation(): void {
    this.updateWorld();
  }

  public getChildren(): readonly ISceneNode[] {
    return [];
  }

  public setPosistion(position: Vector2): void {
    this.positionX = position.x;
    this.positionY = position.y;
    this.#applyTransformAndGeometry(
      { x: this.positionX, y: this.positionY },
      this.#currentRotationRadians
    );
    this.#stateSubject.notify('positionChanged', this.getPosistion());
    this.#stateSubject.notify('rotationChanged', this.getRotation());
    this.requestUpdate();
  }

  public acceptCurrentPosition(): void {
    this.#lastAcceptedMotionState = {
      position: this.getPosistion(),
      rotationRadians: this.#currentRotationRadians
    };
  }

  public rejectCurrentPosition(): void {
    const accepted = this.#lastAcceptedMotionState;
    const current = this.getPosistion();

    if (
      current.x === accepted.position.x &&
      current.y === accepted.position.y &&
      this.#currentRotationRadians === accepted.rotationRadians
    ) {
      return;
    }

    this.positionX = accepted.position.x;
    this.positionY = accepted.position.y;
    this.#currentRotationRadians = accepted.rotationRadians;

    this.#applyTransformAndGeometry(
      accepted.position,
      accepted.rotationRadians
    );

    this.#stateSubject.notify('positionChanged', this.getPosistion());
    this.#stateSubject.notify('rotationChanged', this.getRotation());
    this.requestUpdate();
  }
  
  setScheduler(timeSchedulerObserver: TimeSchdulerObserver): void {
    this.scheduler = timeSchedulerObserver;
  }

  public subscribeState<K extends keyof GameObjectSubjectEvents>(
    eventName: K,
    observer: Observer<GameObjectSubjectEvents, K>
  ): () => void {
    return this.#stateSubject.subscribe(eventName, observer);
  }

  public unsubscribeState<K extends keyof GameObjectSubjectEvents>(
    eventName: K,
    observer: Observer<GameObjectSubjectEvents, K>
  ): boolean {
    return this.#stateSubject.unsubscribe(eventName, observer);
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (changed.has('scheduler')) {
      this.#unsubscribeFromScheduler?.();
      this.#unsubscribeFromScheduler = this.scheduler?.subscribe(this) ?? null;
    }

    if (changed.has('fill') || changed.has('stroke') || changed.has('size')) {
      this.subject = this.#buildSubjectAt(this.getPosistion(), this.#currentRotationRadians);
    }

    if (changed.has('positionX') || changed.has('positionY')) {
      this.#applyTransformAndGeometry(this.getPosistion(), this.#currentRotationRadians);
    }

    if (changed.has('indexOffsetRatio')) {
      this.#animationController.setIndexOffsetRatio(this.indexOffsetRatio);
      this.#animationController.reset();
    }
  }

  disconnectedCallback(): void {
    this.#unsubscribeFromScheduler?.();
    this.#unsubscribeFromScheduler = null;
    super.disconnectedCallback();
  }

  onTime(time: number): void {
    this.#stateSubject.notify('timeAdvanced', time);
    if (this.controller) {
      this.#onTimeByController(time);
      return;
    }

    this.#lastTimeMs = null;
    this.#animationController.onTime(time);
  }

  #onTimeByController(time: number): void {
    const previousTime = this.#lastTimeMs;
    this.#lastTimeMs = time;
    if (previousTime === null) {
      this.acceptCurrentPosition();
      return;
    }

    const deltaMs = Math.max(0, time - previousTime);
    if (deltaMs === 0) return;

    const horizontalAxis = this.controller?.horizontalAxis ?? 0;
    const verticalAxis = this.controller?.verticalAxis ?? 0;
    const firePressed = this.controller?.isFirePressed ?? false;
    if (horizontalAxis === 0 && verticalAxis === 0) {
      if (firePressed) {
        this.fill = '#f59e0b';
        this.stroke = '#b45309';
      } else {
        this.fill = '#60a5fa';
        this.stroke = '#1d4ed8';
      }
      return;
    }

    const deltaSeconds = deltaMs / 1000;
    const step = this.#manualMoveSpeedPerSecond * deltaSeconds;
    const nextX = this.#clamp(this.positionX + horizontalAxis * step, 0, this.#canvasWidth);
    const nextY = this.#clamp(this.positionY + verticalAxis * step, 0, this.#canvasHeight);
    const nextRotation = Math.atan2(verticalAxis, horizontalAxis || 0.000001);
    const nextPoint: Point2 = { x: nextX, y: nextY };

    this.acceptCurrentPosition();

    this.positionX = nextPoint.x;
    this.positionY = nextPoint.y;
    this.#currentRotationRadians = nextRotation;
    this.#applyTransformAndGeometry(this.getPosistion(), this.#currentRotationRadians);
    this.#stateSubject.notify('positionChanged', this.getPosistion());
    this.#stateSubject.notify('rotationChanged', this.getRotation());

    if (firePressed) {
      this.fill = '#f59e0b';
      this.stroke = '#b45309';
    } else {
      this.fill = '#60a5fa';
      this.stroke = '#1d4ed8';
    }
    this.requestUpdate();
  }

  #clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }

  public getPosistion(): Vector2 {
    return { x: this.positionX, y: this.positionY } as Vector2;
  }

  public getWorldPosistion(): Vector2 {
    return this.getPosistion();
  }

  public getRotation(): Vector2 {
    return new Vector2(this.#currentRotationRadians, 0 );
  }

  public getWorldRotation(): Vector2 {
    return this.getRotation();
  }

  public getCurrentPoint(): Point2 | null {
    return { x: this.positionX, y: this.positionY };
  }

  public getCurrentRotationRadians(): number {
    return this.#currentRotationRadians;
  }

  #applyTransformAndGeometry(point: Point2, rotationRadians: number): void {
    this.local = Matrix.translation(point.x, point.y).multiply(
      Matrix.rotation(rotationRadians)
    );
    this.subject = this.#buildSubjectAt(point, rotationRadians);
  }

  #buildSubjectAt(point: Point2, rotationRadians: number): TemplateResult {
    return new SvgRectangleBuilder()
      .withLength(this.size)
      .withHeigth(this.size)
      .withCenter(point)
      .withCanvasSize(this.#canvasWidth, this.#canvasHeight)
      .withCoordinateMapper((vertex: Readonly<Point>) =>
        this.#rotatePoint({
          point: vertex,
          center: point,
          rotationRadians
        })
      )
      .withStyle({
        fill: this.fill,
        stroke: this.stroke,
        strokeWidth: 2
      })
      .build();
  }

  #rotatePoint(options: {
    point: Readonly<Point>;
    center: Readonly<Point>;
    rotationRadians: number;
  }): Point {
    const dx = options.point.x - options.center.x;
    const dy = options.point.y - options.center.y;
    const cos = Math.cos(options.rotationRadians);
    const sin = Math.sin(options.rotationRadians);

    return new Vector2(options.center.x + dx * cos - dy * sin, options.center.y + dx * sin + dy * cos
    );
  }

  protected render(): TemplateResult {
    return html`${this.subject}`;
  }
}







