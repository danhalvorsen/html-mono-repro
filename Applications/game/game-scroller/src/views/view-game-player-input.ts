import { Vector2 as CollisionVector2, type Point2 } from "@monorepo/core-math";
import {
  Polygon as CollisionPolygon,
  PolygonCollisionSystemRoot,
  type PolygonCollisionResult,
} from "@monorepo/core-collision-polygons";
import { LitElement, css, html, type TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { Camera } from "../Game/Camera.js";
import {
  CollisionSystemReactiveController,
  type CollisionObservedGameObject,
  type CollisionTargetPolygons,
  type ICollisionReactiveController,
} from "../Game/Collision/CollisionSystemReactiveController.js";
import type { ICollisionMovementConstraintTarget } from "../Game/GameObjectSubject.js";
import "../Game/Screen/Cave/CaveGameObject.js";
import {
  PlayerInputController,
  WasdXPlayerKeyMap,
} from "../Game/Input/index.js";
import { TimeSchdulerObserver } from "../Game/TimeSchdulerObserver.js";
import { PlayerGameObject } from "../GameObjects/PlayerGameObject.js";

interface CaveGeneratedCurvesProvider {
  getGeneratedCurves(): {
    readonly reference: readonly Point2[];
    readonly upper: readonly Point2[];
    readonly lower: readonly Point2[];
  };
}

@customElement("view-game-player-input")
export class ViewGamePlayerInput extends LitElement {
  public static override styles = css`
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

  private readonly playerInputController = new PlayerInputController(
    this,
    new WasdXPlayerKeyMap(),
    undefined,
    window,
  );

  private readonly collisionReactiveController: ICollisionReactiveController =
    new CollisionSystemReactiveController({
      host: this,
      collisionSystem: PolygonCollisionSystemRoot.createDefault(),
      sourcePolygonProvider: (observedGameObject) =>
        this.createSourcePolygon(observedGameObject),
      targetPolygonProvider: () => {
        const cave = this.renderRoot.querySelector("cave-game-object");

        if (!isCollisionTargetProvider(cave)) {
          return emptyCollisionTargetPolygons();
        }

        return cave.getCollisionTargetPolygons();
      },
      onCollisionResult: (result) => {
        this.handleCollisionResult(result);
      },
    });

  public override connectedCallback(): void {
    super.connectedCallback();
    this.camera.setScheduler(this.scheduler);
    this.scheduler.start();
  }

  protected override async firstUpdated(): Promise<void> {
    const player = this.renderRoot.querySelector("player-game-object");

    if (!(player instanceof PlayerGameObject)) {
      return;
    }

    const cave = this.renderRoot.querySelector("cave-game-object");

    if (isCollisionObservingCave(cave)) {
      await cave.updateComplete;
    }

    if (isCaveGeneratedCurvesProvider(cave)) {
      this.placePlayerInsideCave(player, cave);
    }

    this.camera.setFollowTarget(player);

    if (isCollisionObservingCave(cave)) {
      cave.observeGameObject(player);
    }
  }

  public override disconnectedCallback(): void {
    this.scheduler.stop();
    this.camera.setFollowTarget(undefined);
    this.camera.setScheduler(undefined);
    this.collisionReactiveController.setObservedGameObject(null);
    super.disconnectedCallback();
  }

  protected override render(): TemplateResult {
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
            .fill=${"#60a5fa"}
            .stroke=${"#1d4ed8"}
          ></player-game-object>
        </cave-game-object>
      </section>
    `;
  }

  private placePlayerInsideCave(
    player: PlayerGameObject,
    cave: CaveGeneratedCurvesProvider,
  ): void {
    const curves = cave.getGeneratedCurves();

    const startPoint = resolvePointInsideCorridor({
      x: 100,
      fallbackY: 150,
      size: player.size,
      reference: curves.reference,
      upper: curves.upper,
      lower: curves.lower,
    });

    player.setPosistion(new CollisionVector2(startPoint.x, startPoint.y));
    player.acceptCurrentPosition();
  }

  private handleCollisionResult(result: PolygonCollisionResult): void {
    this.applyCollisionMovementConstraint(result);

    const cave = this.renderRoot.querySelector("cave-game-object");

    if (isCollisionFeedbackCave(cave)) {
      cave.handleCollisionResult(result);
    }
  }

  private applyCollisionMovementConstraint(result: PolygonCollisionResult): void {
    const player = this.renderRoot.querySelector("player-game-object");

    if (!isCollisionMovementConstraintTarget(player)) {
      return;
    }

    if (result.hasCollide) {
      player.rejectCurrentPosition();
      return;
    }

    player.acceptCurrentPosition();
  }

  private createSourcePolygon(
    observedGameObject: CollisionObservedGameObject,
  ): CollisionPolygon {
    const position = observedGameObject.getWorldPosistion();
    const size = resolveObservedGameObjectSize(observedGameObject);
    const halfSize = size / 2;

    return CollisionPolygon.closed([
      new CollisionVector2(position.x - halfSize, position.y - halfSize),
      new CollisionVector2(position.x + halfSize, position.y - halfSize),
      new CollisionVector2(position.x + halfSize, position.y + halfSize),
      new CollisionVector2(position.x - halfSize, position.y + halfSize),
    ]);
  }
}

function resolvePointInsideCorridor(options: {
  readonly x: number;
  readonly fallbackY: number;
  readonly size: number;
  readonly reference: readonly Point2[];
  readonly upper: readonly Point2[];
  readonly lower: readonly Point2[];
}): Point2 {
  const upper = findNearestPointByX(options.upper, options.x);
  const lower = findNearestPointByX(options.lower, options.x);
  const reference = findNearestPointByX(options.reference, options.x);

  if (upper === null || lower === null) {
    return {
      x: options.x,
      y: reference?.y ?? options.fallbackY,
    };
  }

  const halfSize = Math.max(0, options.size / 2);
  const minY = Math.min(upper.y, lower.y) + halfSize;
  const maxY = Math.max(upper.y, lower.y) - halfSize;
  const preferredY = reference?.y ?? (minY + maxY) / 2;

  if (maxY < minY) {
    return {
      x: options.x,
      y: (upper.y + lower.y) / 2,
    };
  }

  return {
    x: options.x,
    y: clamp(preferredY, minY, maxY),
  };
}

function findNearestPointByX(
  points: readonly Point2[],
  x: number,
): Point2 | null {
  const first = points[0];

  if (first === undefined) {
    return null;
  }

  let nearest = first;
  let nearestDistance = Math.abs(first.x - x);

  for (const point of points) {
    const distance = Math.abs(point.x - x);

    if (distance >= nearestDistance) {
      continue;
    }

    nearest = point;
    nearestDistance = distance;
  }

  return nearest;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function resolveObservedGameObjectSize(
  observedGameObject: CollisionObservedGameObject,
): number {
  const candidate = (observedGameObject as { readonly size?: unknown }).size;

  if (typeof candidate !== "number") {
    return 16;
  }

  if (!Number.isFinite(candidate) || candidate <= 0) {
    return 16;
  }

  return candidate;
}

function emptyCollisionTargetPolygons(): CollisionTargetPolygons {
  return {
    upper: null,
    lower: null,
  };
}

function isCollisionObservingCave(
  value: unknown,
): value is HTMLElement & {
  readonly updateComplete: Promise<boolean>;
  observeGameObject(gameObject: CollisionObservedGameObject | null): void;
} {
  return (
    typeof value === "object" &&
    value !== null &&
    "updateComplete" in value &&
    "observeGameObject" in value &&
    typeof value.observeGameObject === "function"
  );
}

function isCaveGeneratedCurvesProvider(
  value: unknown,
): value is CaveGeneratedCurvesProvider {
  return (
    typeof value === "object" &&
    value !== null &&
    "getGeneratedCurves" in value &&
    typeof value.getGeneratedCurves === "function"
  );
}

function isCollisionTargetProvider(
  value: unknown,
): value is {
  getCollisionTargetPolygons(): CollisionTargetPolygons;
} {
  return (
    typeof value === "object" &&
    value !== null &&
    "getCollisionTargetPolygons" in value &&
    typeof value.getCollisionTargetPolygons === "function"
  );
}

function isCollisionMovementConstraintTarget(
  value: unknown,
): value is ICollisionMovementConstraintTarget {
  return (
    typeof value === "object" &&
    value !== null &&
    "acceptCurrentPosition" in value &&
    "rejectCurrentPosition" in value &&
    typeof value.acceptCurrentPosition === "function" &&
    typeof value.rejectCurrentPosition === "function"
  );
}

function isCollisionFeedbackCave(
  value: unknown,
): value is {
  handleCollisionResult(result: PolygonCollisionResult): void;
  flashCollision(durationMs?: number): void;
} {
  return (
    typeof value === "object" &&
    value !== null &&
    "flashCollision" in value &&
    typeof value.flashCollision === "function"
  );
}

declare global {
  interface HTMLElementTagNameMap {
    "view-game-player-input": ViewGamePlayerInput;
  }
}
