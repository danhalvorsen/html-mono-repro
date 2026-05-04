import { html, LitElement, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import type { TimeSchdulerObserver } from './ObjectObjectTimerObserver';
import { SvgRectangleBuilder } from './Builders/SvgPolygonBuilder';
import type { GamePolygon } from './GamePolygon';

export interface IGameObjectSubject extends LitElement {
  onTime(time: number): void;
}

@customElement('game-object-subject')
export class GameObjectSubject extends LitElement implements IGameObjectSubject {
  #unsubscribeFromScheduler: (() => void) | null = null;
  #scheduler: TimeSchdulerObserver | null = null;

  private subject: GamePolygon;

  public constructor(subject?: GamePolygon) {
    super();
    this.subject = subject ?? new SvgRectangleBuilder()
      .withX(20)
      .withY(20)
      .withLength(120)
      .withHeigth(80)
      .withCanvasSize(500, 300)
      .withStyle({
        fill: '#4ade80',
        stroke: '#166534',
        strokeWidth: 2
      })
      .build();
  }

  setScheduler(timeSchedulerObserver: TimeSchdulerObserver): void {
    this.#unsubscribeFromScheduler?.();
    this.#scheduler = timeSchedulerObserver;
    this.#unsubscribeFromScheduler = this.#scheduler.subscribe(this);
  }

  onTime(_time: number): void {}

  protected render(): TemplateResult {
    return html`
      <h3>GameObject</h3>
      ${this.subject}
      <slot></slot>
    `;
  }
}
