import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { TimeSchdulerObserver } from './ObjectObjectTimerObserver';
import { SvgRectangleBuilder } from './Builders/SvgPolygonBuilder';
import type { GamePolygon } from './GamePolygon';
import type { Point2 } from '@monorepo/core-math';
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
  size = 50;

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
    this.subject = subject ?? this.#buildSubjectAt({ x: 20, y: 20 });
    this.#animationController = new GameObjectAnimationController({
      host: this,
      indexOffsetRatio: this.indexOffsetRatio,
      onFrame: ({ point }) => {
        this.subject = this.#buildSubjectAt(point);
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
      this.subject = this.#buildSubjectAt(point);
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

  #buildSubjectAt(point: Point2): GamePolygon {
    return new SvgRectangleBuilder()
      .withLength(this.size)
      .withHeigth(this.size)
      .withCenter(point)
      .withCanvasSize(this.#canvasWidth, this.#canvasHeight)
      .withStyle({
        fill: this.fill,
        stroke: this.stroke,
        strokeWidth: 2
      })
      .build();
  }

  protected render(): TemplateResult {
    return html`${this.subject}`;
  }
}
