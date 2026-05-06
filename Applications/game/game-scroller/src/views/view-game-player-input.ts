// FILE: src/views/view-game-player-input.ts

import { Polygon, PolygonCollisionSystemRoot } from '@monorepo/core-collision-polygons';
import { LitElement, css, html, type TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Camera } from '../Game/Camera.js';
import {
  CollisionSystemReactiveController,
  type CollisionObservedGameObject,
} from '../Game/Collision/index.js';
import '../Game/Screen/Cave/CaveGameObject.js';
import { PlayerInputController, WasdXPlayerKeyMap } from '../Game/Input/index.js';
import { TimeSchdulerObserver } from '../Game/TimeSchdulerObserver.js';
import { PlayerGameObject } from '../GameObjects/PlayerGameObject.js';
import { Vector2 } from '@monorepo/core-math';

@customElement('view-game-player-input')
export class ViewGamePlayerInput extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .panel {
      border: 1px solid #2a3042;
      border-radius: 12px;
      background: #121523;
      padding: 14px;
    }

    h2 {
      margin: 0 0 8px 0;
      font-size: 16px;
      color: #bdc8f4;
    }

    p {
      margin: 0 0 12px 0;
      color: #9fb0ea;
      font-size: 13px;
    }

    cave-game-object {
      display: block;
      width: 100%;
    }
  `;

  private readonly scheduler = new TimeSchdulerObserver();

  private readonly camera = new Camera({
    viewport: { width: 900, height: 300 },
    world: { width: 1500, height: 300 },
  });

  private readonly collisionReactiveController =
    new CollisionSystemReactiveController({
      host: this,
      collisionSystem: PolygonCollisionSystemRoot.createDefault(),
      sourcePolygonProvider: observedGameObject =>
        this.createSourcePolygon(observedGameObject),
      targetPolygonProvider: () => {
        const cave = this.renderRoot.querySelector('cave-game-object');

        if (!isCollisionTargetProvider(cave)) {
          return null;
        }

        return cave.getTargetPolygon();
      },
      onCollisionResult: result => {
        if (result.hasCollide) {
          console.log('collision', result);
        }
      },
    });

  private readonly playerInputController = new PlayerInputController(
    this,
    new WasdXPlayerKeyMap(),
    undefined,
    window
  );

  public override connectedCallback(): void {
    super.connectedCallback();
    this.camera.setScheduler(this.scheduler);
    this.scheduler.start();
  }

// FILE: src/views/view-game-player-input.ts

// FILE: src/views/view-game-player-input.ts

protected override async firstUpdated(): Promise<void> {
  const player = this.renderRoot.querySelector('player-game-object');

  if (!(player instanceof PlayerGameObject)) {
    return;
  }

  this.camera.setFollowTarget(player);

  const cave = this.renderRoot.querySelector('cave-game-object');

  if (!isCollisionObservingCave(cave)) {
    return;
  }

  await cave.updateComplete;

  cave.observeGameObject(player);
}
  public override disconnectedCallback(): void {
    this.scheduler.stop();
    this.camera.setFollowTarget(undefined);
    this.camera.setScheduler(undefined);
    this.collisionReactiveController.setObservedGameObject(null);
    super.disconnectedCallback();
  }

  protected render(): TemplateResult {
    return html`
      <section class="panel">
        <h2>Player Keyboard Input</h2>
        <p>Controls: W(up), A(left), D(right), X(down), Space(fire).</p>

        <cave-game-object
          .scheduler=${this.scheduler}
          .camera=${this.camera}
          .collisionReactiveController=${this.collisionReactiveController}
          .viewportWidth=${900}
          .viewportHeight=${300}
          .showReferenceCurve=${false}
          .closeUpperLowerToBounds=${true}
        >
          <player-game-object
            slot="overlay-start"
            .scheduler=${this.scheduler}
            .controller=${this.playerInputController}
            .positionX=${100}
            .positionY=${150}
            .size=${16}
            fill="#60a5fa"
            stroke="#1d4ed8"
          ></player-game-object>
        </cave-game-object>
      </section>
    `;
  }

 private createSourcePolygon(
  observedGameObject: CollisionObservedGameObject
): Polygon {
  const position = observedGameObject.getWorldPosistion();
  const halfSize = 8;

  return Polygon.closed([
    new Vector2(position.x - halfSize, position.y - halfSize),
    new Vector2(position.x + halfSize, position.y - halfSize),
    new Vector2(position.x + halfSize, position.y + halfSize),
    new Vector2(position.x - halfSize, position.y + halfSize),
  ]);
}
}

function isCollisionObservingCave(
  value: unknown
): value is HTMLElement & {
  observeGameObject(gameObject: CollisionObservedGameObject | null): void;
} {
  return (
    typeof value === 'object' &&
    value !== null &&
    'observeGameObject' in value &&
    typeof value.observeGameObject === 'function'
  );
}

function isCollisionTargetProvider(
  value: unknown
): value is {
  getTargetPolygon(): Polygon | null;
} {
  return (
    typeof value === 'object' &&
    value !== null &&
    'getTargetPolygon' in value &&
    typeof value.getTargetPolygon === 'function'
  );
}

declare global {
  interface HTMLElementTagNameMap {
    'view-game-player-input': ViewGamePlayerInput;
  }
}