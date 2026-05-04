import { html, LitElement, type TemplateResult } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { customElement, property } from 'lit/decorators.js';

import type { TimeSchdulerObserver } from './ObjectObjectTimerObserver.js';

import './Srceens/Cave/CaveGameObject.js';
import './GameObjectSubject.js';

type GameObjectViewModel = {
  readonly id: string;
  readonly slot: 'overlay-center';
  readonly fill: string;
  readonly stroke: string;
  readonly size: number;
  readonly indexOffsetRatio: number;
};

class GameObjectPlacementFactory {
  public create(count: number): readonly GameObjectViewModel[] {
    return Array.from({ length: count }, (_, index) => {
      const ratio = (index + 0.5) / count;

      return {
        id: `game-object-${index}`,
        slot: 'overlay-center',
        fill: this.getFill(index),
        stroke: this.getStroke(index),
        size: 10,
        indexOffsetRatio: ratio
      };
    });
  }

  private getFill(index: number): string {
    return index % 2 === 0 ? '#60a5fa' : '#facc15';
  }

  private getStroke(index: number): string {
    return index % 2 === 0 ? '#1d4ed8' : '#a16207';
  }
}

const placementFactory = new GameObjectPlacementFactory();

@customElement('game-canvas')
export class GameCanvas extends LitElement {
  private readonly gameObjects = placementFactory.create(100);

  @property({ attribute: false })
  public scheduler?: TimeSchdulerObserver;

  protected override render(): TemplateResult {
    return html`
      <h3>Canvas</h3>

      <cave-game-object .scheduler=${this.scheduler}>
        ${repeat(
          this.gameObjects,
          gameObject => gameObject.id,
          gameObject => html`
            <game-object-subject
              slot=${gameObject.slot}
              .scheduler=${this.scheduler}
              .fill=${gameObject.fill}
              .stroke=${gameObject.stroke}
              .size=${gameObject.size}
              .indexOffsetRatio=${gameObject.indexOffsetRatio}
            ></game-object-subject>
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