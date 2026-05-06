# FILE: powershell.ps1
# Run from: Applications/game/game-scroller

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$root = (Get-Location).Path

function Read-SourceFile {
    param([Parameter(Mandatory)] [string] $Path)

    if (-not (Test-Path $Path)) {
        throw "File not found: $Path"
    }

    return (Get-Content -Raw -Path $Path).Replace("`r`n", "`n")
}

function Write-SourceFile {
    param(
        [Parameter(Mandatory)] [string] $Path,
        [Parameter(Mandatory)] [string] $Text
    )

    $windowsText = $Text.Replace("`n", "`r`n")
    Set-Content -Path $Path -Value $windowsText -Encoding UTF8 -NoNewline
}

function Replace-Required {
    param(
        [Parameter(Mandatory)] [string] $Path,
        [Parameter(Mandatory)] [string] $Old,
        [Parameter(Mandatory)] [string] $New
    )

    $text = Read-SourceFile -Path $Path
    $oldNormalized = $Old.Replace("`r`n", "`n")
    $newNormalized = $New.Replace("`r`n", "`n")

    if (-not $text.Contains($oldNormalized)) {
        throw "Expected source block was not found in: $Path"
    }

    Write-SourceFile -Path $Path -Text $text.Replace($oldNormalized, $newNormalized)
}

$viewPath = Join-Path $root "src\views\view-game-player-input.ts"
$cavePath = Join-Path $root "src\Game\Screen\Cave\CaveGameObject.ts"
$gameObjectSubjectPath = Join-Path $root "src\Game\GameObjectSubject.ts"

# ---------------------------------------------------------------------
# Fix view-game-player-input.ts:
# - Use canonical collision controller import path.
# - Type the controller as ICollisionReactiveController.
# - Delegate collision result handling back into CaveGameObject.
# ---------------------------------------------------------------------

Replace-Required `
    -Path $viewPath `
    -Old @'
import {
  Polygon as CollisionPolygon,
  PolygonCollisionSystemRoot,
} from '@monorepo/core-collision-polygons';
'@ `
    -New @'
import {
  Polygon as CollisionPolygon,
  PolygonCollisionSystemRoot,
  type PolygonCollisionResult,
} from '@monorepo/core-collision-polygons';
'@

Replace-Required `
    -Path $viewPath `
    -Old @'
import {
  CollisionSystemReactiveController,
  type CollisionObservedGameObject,
  type CollisionTargetPolygons,
} from '../Game/Collision/index.js';
'@ `
    -New @'
import {
  CollisionSystemReactiveController,
  type CollisionObservedGameObject,
  type CollisionTargetPolygons,
  type ICollisionReactiveController,
} from '../Game/Collision/CollisionSystemReactiveController.js';
'@

Replace-Required `
    -Path $viewPath `
    -Old @'
  private readonly collisionReactiveController =
    new CollisionSystemReactiveController({
'@ `
    -New @'
  private readonly collisionReactiveController: ICollisionReactiveController =
    new CollisionSystemReactiveController({
'@

Replace-Required `
    -Path $viewPath `
    -Old @'
      onCollisionResult: result => {
        if (!result.hasCollide) {
          return;
        }

        const cave = this.renderRoot.querySelector('cave-game-object');

        if (isCollisionFeedbackCave(cave)) {
          cave.flashCollision(90);
        }
      },
'@ `
    -New @'
      onCollisionResult: result => {
        this.handleCollisionResult(result);
      },
'@

Replace-Required `
    -Path $viewPath `
    -Old @'
  private createSourcePolygon(
    observedGameObject: CollisionObservedGameObject
  ): CollisionPolygon {
'@ `
    -New @'
  private handleCollisionResult(result: PolygonCollisionResult): void {
    const cave = this.renderRoot.querySelector('cave-game-object');

    if (isCollisionFeedbackCave(cave)) {
      cave.handleCollisionResult(result);
    }
  }

  private createSourcePolygon(
    observedGameObject: CollisionObservedGameObject
  ): CollisionPolygon {
'@

Replace-Required `
    -Path $viewPath `
    -Old @'
function isCollisionFeedbackCave(
  value: unknown
): value is {
  flashCollision(durationMs?: number): void;
} {
'@ `
    -New @'
function isCollisionFeedbackCave(
  value: unknown
): value is {
  handleCollisionResult(result: PolygonCollisionResult): void;
  flashCollision(durationMs?: number): void;
} {
'@

# ---------------------------------------------------------------------
# Fix CaveGameObject.ts:
# - Keep player-game-object as a slot child.
# - Use collision result propagation to accept/reject the player movement.
# ---------------------------------------------------------------------

Replace-Required `
    -Path $cavePath `
    -Old @'
type CaveGameObjectReferenceTarget = HTMLElement & {
  caveGameObject?: CaveGameObject;
};

@customElement('cave-game-object')
'@ `
    -New @'
type CaveGameObjectReferenceTarget = HTMLElement & {
  caveGameObject?: CaveGameObject;
};

type CollisionMovementConstraintTarget = {
  acceptCurrentPosition(): void;
  rejectCurrentPosition(): void;
};

@customElement('cave-game-object')
'@

Replace-Required `
    -Path $cavePath `
    -Old @'
  public handleCollisionResult(result: PolygonCollisionResult): void {
    if (result.hasCollide) {
      this.flashCollision(90);
    }
  }
'@ `
    -New @'
  public handleCollisionResult(result: PolygonCollisionResult): void {
    this.#propagateCollisionResultToObservedGameObject(result);

    if (result.hasCollide) {
      this.flashCollision(90);
    }
  }

  #propagateCollisionResultToObservedGameObject(
    result: PolygonCollisionResult
  ): void {
    const observedGameObject =
      this.collisionReactiveController?.observedGameObject ?? null;

    if (!isCollisionMovementConstraintTarget(observedGameObject)) {
      return;
    }

    if (result.hasCollide) {
      observedGameObject.rejectCurrentPosition();
      return;
    }

    observedGameObject.acceptCurrentPosition();
  }
'@

Replace-Required `
    -Path $cavePath `
    -Old @'
declare global {
  interface HTMLElementTagNameMap {
    'cave-game-object': CaveGameObject;
  }
}
'@ `
    -New @'
function isCollisionMovementConstraintTarget(
  value: unknown
): value is CollisionMovementConstraintTarget {
  return (
    typeof value === 'object' &&
    value !== null &&
    'acceptCurrentPosition' in value &&
    'rejectCurrentPosition' in value &&
    typeof value.acceptCurrentPosition === 'function' &&
    typeof value.rejectCurrentPosition === 'function'
  );
}

declare global {
  interface HTMLElementTagNameMap {
    'cave-game-object': CaveGameObject;
  }
}
'@

# ---------------------------------------------------------------------
# Fix GameObjectSubject.ts:
# - Add movement acceptance/rejection contract.
# - Store last accepted motion state.
# - Roll back when CaveGameObject rejects a colliding movement.
# ---------------------------------------------------------------------

Replace-Required `
    -Path $gameObjectSubjectPath `
    -Old @'
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

@customElement('game-object-subject')
'@ `
    -New @'
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
'@

Replace-Required `
    -Path $gameObjectSubjectPath `
    -Old @'
  implements IGameObjectSubject, IGameObjectObservableSubject, ISceneNode
'@ `
    -New @'
  implements IGameObjectSubject, IGameObjectObservableSubject, ICollisionMovementConstraintTarget, ISceneNode
'@

Replace-Required `
    -Path $gameObjectSubjectPath `
    -Old @'
  #currentRotationRadians = 0;
  #lastTimeMs: number | null = null;
'@ `
    -New @'
  #currentRotationRadians = 0;
  #lastAcceptedMotionState: GameObjectMotionState = {
    position: { x: this.positionX, y: this.positionY },
    rotationRadians: 0
  };
  #lastTimeMs: number | null = null;
'@

Replace-Required `
    -Path $gameObjectSubjectPath `
    -Old @'
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
  
  setScheduler(timeSchedulerObserver: TimeSchdulerObserver): void {
'@ `
    -New @'
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
'@

Replace-Required `
    -Path $gameObjectSubjectPath `
    -Old @'
    if (previousTime === null) return;
'@ `
    -New @'
    if (previousTime === null) {
      this.acceptCurrentPosition();
      return;
    }
'@

Replace-Required `
    -Path $gameObjectSubjectPath `
    -Old @'
    const nextPoint: Point2 = { x: nextX, y: nextY };

    this.positionX = nextPoint.x;
'@ `
    -New @'
    const nextPoint: Point2 = { x: nextX, y: nextY };

    this.acceptCurrentPosition();

    this.positionX = nextPoint.x;
'@

Write-Host "Patched player input collision propagation."
Write-Host "Now run: pnpm build"