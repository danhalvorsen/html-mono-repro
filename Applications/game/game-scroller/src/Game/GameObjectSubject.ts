import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { TimeSchdulerObserver } from './TimeSchdulerObserver';
import { SvgRectangleBuilder } from './Builders/SvgPolygonBuilder';
import type { GamePolygon } from './GamePolygon';
import { Matrix, type IMatrix, type Point, type Point2 } from '@monorepo/core-math';
import { GameObjectAnimationController } from './Animation/GameObjectAnimationController';
import type { ISceneNode } from '../../../../../packages/core-scene-graph/dist/ISceneNode';
import type { Vector2 } from '../GameObjects/RectangleGameObjects';
import type { ICaveGameObjectReference } from './ICaveGameObjectReference';

export interface IGameObjectSubject {
  onTime(time: number): void;
  getPosistion(): Vector2 ;
  getWorldPosistion(): Vector2 ;
  getRotation(): Vector2;
  getWorldRotation(): Vector2;
 
}

@customElement('game-object-subject')
export class GameObjectSubject extends LitElement implements IGameObjectSubject, ISceneNode {
  #unsubscribeFromScheduler: (() => void) | null = null;
  readonly #canvasWidth = 1500;
  readonly #canvasHeight = 300;

  @property({ attribute: false })
  caveGameObject?: ICaveGameObjectReference;

  @property({ attribute: false })
  scheduler?: TimeSchdulerObserver;

  @property({ type: Number })
  size = 10;

  @property({ type: String })
  fill = '#60a5fa';

  @property({ type: String })
  stroke = '#1d4ed8';

  @property({ type: Number })
  indexOffsetRatio = 0;

  private subject: GamePolygon;
  readonly #animationController: GameObjectAnimationController;
  #currentPoint: Point2 = { x: 20, y: 20 };
  #currentRotationRadians = 0;

  public constructor(subject?: GamePolygon) {
    super();
    this.subject = subject ?? this.#buildSubjectAt({ x: 20, y: 20 }, 0);
    this.#animationController = new GameObjectAnimationController({
      host: this,
      indexOffsetRatio: this.indexOffsetRatio,
      onFrame: ({ point, rotationRadians }) => {
        this.#currentPoint = { x: point.x, y: point.y };
        this.#currentRotationRadians = rotationRadians;
        this.local = Matrix.translation(point.x, point.y).multiply(
          Matrix.rotation(rotationRadians)
        );
        this.subject = this.#buildSubjectAt(point, rotationRadians);
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

  setScheduler(timeSchedulerObserver: TimeSchdulerObserver): void {
    this.scheduler = timeSchedulerObserver;
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (changed.has('scheduler')) {
      this.#unsubscribeFromScheduler?.();
      this.#unsubscribeFromScheduler = this.scheduler?.subscribe(this) ?? null;
    }

    if (changed.has('fill') || changed.has('stroke') || changed.has('size')) {
      const point = this.#animationController.getCurrentPoint() ?? { x: 20, y: 20 };
      const rotationRadians = this.#animationController.getCurrentRotationRadians();
      this.subject = this.#buildSubjectAt(point, rotationRadians);
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
    this.#animationController.onTime(time);
  }

  public getPosistion(): Vector2 {
    return { x: this.#currentPoint.x, y: this.#currentPoint.y };
  }

  public getWorldPosistion(): Vector2 {
    return this.getPosistion();
  }

  public getRotation(): Vector2 {
    return { x: this.#currentRotationRadians, y: 0 };
  }

  public getWorldRotation(): Vector2 {
    return this.getRotation();
  }

  public getCurrentPoint(): Point2 | null {
    return { x: this.#currentPoint.x, y: this.#currentPoint.y };
  }

  public getCurrentRotationRadians(): number {
    return this.#currentRotationRadians;
  }

  #buildSubjectAt(point: Point2, rotationRadians: number): GamePolygon {
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

    return {
      x: options.center.x + dx * cos - dy * sin,
      y: options.center.y + dx * sin + dy * cos
    };
  }

  protected render(): TemplateResult {
    return html`${this.subject}`;
  }
}
