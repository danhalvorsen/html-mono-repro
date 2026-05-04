import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { TimeSchdulerObserver } from './ObjectObjectTimerObserver';
import { SvgRectangleBuilder } from './Builders/SvgPolygonBuilder';
import type { GamePolygon } from './GamePolygon';
import type { Point, Point2 } from '@monorepo/core-math';
import { GameObjectAnimationController } from './Animation/GameObjectAnimationController';

export interface ICurveCollection {
  readonly reference: readonly Point2[];
  readonly upper: readonly Point2[];
  readonly lower: readonly Point2[];
}

export interface ICaveGameObjectReference {
  getGeneratedCurves(): ICurveCollection;
}

export interface IGameObjectSubject extends LitElement {
  onTime(time: number): void;
}

@customElement('game-object-subject')
export class GameObjectSubject extends LitElement implements IGameObjectSubject {
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

  public constructor(subject?: GamePolygon) {
    super();
    this.subject = subject ?? this.#buildSubjectAt({ x: 20, y: 20 }, 0);
    this.#animationController = new GameObjectAnimationController({
      host: this,
      indexOffsetRatio: this.indexOffsetRatio,
      onFrame: ({ point, rotationRadians }) => {
        this.subject = this.#buildSubjectAt(point, rotationRadians);
      }
    });
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

  public getCurrentPoint(): Point2 | null {
    return this.#animationController.getCurrentPoint();
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
