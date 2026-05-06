# FILE: fix-collision-controller-contract.ps1
# Run from: Applications/game/game-scroller

[CmdletBinding()]
param(
  [string] $ModuleRoot = "."
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Utf8NoBom = [System.Text.UTF8Encoding]::new($false)

function Resolve-ModuleRoot {
  param([string] $Path)

  $resolved = (Resolve-Path -LiteralPath $Path).Path

  if (
    (Test-Path -LiteralPath (Join-Path $resolved "package.json") -PathType Leaf) -and
    (Test-Path -LiteralPath (Join-Path $resolved "src") -PathType Container)
  ) {
    return $resolved
  }

  throw "ModuleRoot must point to Applications/game/game-scroller."
}

function Join-ModulePath {
  param(
    [string] $Root,
    [string] $RelativePath
  )

  return Join-Path $Root ($RelativePath.Replace("/", [System.IO.Path]::DirectorySeparatorChar))
}

function Write-ModuleFile {
  param(
    [string] $Root,
    [string] $RelativePath,
    [string] $Content
  )

  $path = Join-ModulePath -Root $Root -RelativePath $RelativePath
  $directory = Split-Path -Parent $path

  if (-not (Test-Path -LiteralPath $directory -PathType Container)) {
    New-Item -ItemType Directory -Path $directory | Out-Null
  }

  [System.IO.File]::WriteAllText(
    $path,
    $Content.Trim() + [Environment]::NewLine,
    $Utf8NoBom
  )

  Write-Host "wrote $RelativePath"
}

$Root = Resolve-ModuleRoot -Path $ModuleRoot

Write-ModuleFile -Root $Root -RelativePath "src/Game/Collision/CollisionSystemReactiveController.ts" -Content @'
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type {
  Polygon,
  PolygonCollisionResult,
  PolygonCollisionSystem,
} from '@monorepo/core-collision-polygons';
import type {
  IGameObjectObservableSubject,
  IGameObjectSubject,
} from '../GameObjectSubject.js';
import { CollisionIntersectionControl } from './Objects/Intersection/CollisionIntersectionControl.js';
import { ObservedGameObjectBinding } from './Objects/Observable/ObservedGameObjectBinding.js';

export type CollisionObservedGameObject =
  IGameObjectSubject &
  IGameObjectObservableSubject;

export type SourceCollisionPolygonProvider = (
  observedGameObject: CollisionObservedGameObject
) => Polygon | null;

export type TargetCollisionPolygonProvider = () => Polygon | null;

export type CollisionResultObserver = (
  result: PolygonCollisionResult
) => void;

export interface CollisionSystemReactiveControllerOptions {
  readonly host: ReactiveControllerHost;
  readonly collisionSystem: PolygonCollisionSystem;
  readonly sourcePolygonProvider: SourceCollisionPolygonProvider;
  readonly targetPolygonProvider: TargetCollisionPolygonProvider;
  readonly onCollisionResult?: CollisionResultObserver;
}

export class CollisionSystemReactiveController implements ReactiveController {
  readonly #host: ReactiveControllerHost;
  readonly #observer: ObservedGameObjectBinding;
  readonly #intersectionControl: CollisionIntersectionControl;

  public constructor(options: CollisionSystemReactiveControllerOptions) {
    this.#host = options.host;

    this.#intersectionControl = new CollisionIntersectionControl({
      collisionSystem: options.collisionSystem,
      sourcePolygonProvider: options.sourcePolygonProvider,
      targetPolygonProvider: options.targetPolygonProvider,
      onCollisionResult: options.onCollisionResult ?? null,
      onStateChanged: () => this.#host.requestUpdate(),
    });

    this.#observer = new ObservedGameObjectBinding({
      onObservedGameObjectChanged: observedGameObject => {
        this.#intersectionControl.setObservedGameObject(observedGameObject);
        this.#intersectionControl.checkCollision();
      },
    });

    this.#host.addController(this);
  }

  public get observedGameObject(): CollisionObservedGameObject | null {
    return this.#observer.observedGameObject;
  }

  public get lastResult(): PolygonCollisionResult | null {
    return this.#intersectionControl.lastResult;
  }

  public hostDisconnected(): void {
    this.#observer.clear();
    this.#intersectionControl.clear();
  }

  public setObservedGameObject(
    observedGameObject: CollisionObservedGameObject | null | undefined
  ): void {
    this.#observer.bind(observedGameObject ?? null);
  }

  public checkCollision(): PolygonCollisionResult | null {
    return this.#intersectionControl.checkCollision();
  }
}
'@

Write-ModuleFile -Root $Root -RelativePath "src/Game/Collision/Objects/Intersection/CollisionIntersectionControlOptions.ts" -Content @'
import type { PolygonCollisionSystem } from '@monorepo/core-collision-polygons';
import type {
  CollisionResultObserver,
  SourceCollisionPolygonProvider,
  TargetCollisionPolygonProvider,
} from '../../CollisionSystemReactiveController.js';

export interface CollisionIntersectionControlOptions {
  readonly collisionSystem: PolygonCollisionSystem;
  readonly sourcePolygonProvider: SourceCollisionPolygonProvider;
  readonly targetPolygonProvider: TargetCollisionPolygonProvider;
  readonly onCollisionResult: CollisionResultObserver | null;
  readonly onStateChanged: () => void;
}
'@

Write-ModuleFile -Root $Root -RelativePath "src/Game/Collision/Objects/Intersection/CollisionIntersectionControl.ts" -Content @'
import type {
  PolygonCollisionResult,
  PolygonCollisionSystem,
} from '@monorepo/core-collision-polygons';
import type { CollisionObservedGameObject } from '../../CollisionSystemReactiveController.js';
import type { CollisionIntersectionControlOptions } from './CollisionIntersectionControlOptions.js';

export class CollisionIntersectionControl {
  readonly #collisionSystem: PolygonCollisionSystem;
  readonly #sourcePolygonProvider: CollisionIntersectionControlOptions['sourcePolygonProvider'];
  readonly #targetPolygonProvider: CollisionIntersectionControlOptions['targetPolygonProvider'];
  readonly #onCollisionResult: CollisionIntersectionControlOptions['onCollisionResult'];
  readonly #onStateChanged: () => void;

  #observedGameObject: CollisionObservedGameObject | null = null;
  #lastResult: PolygonCollisionResult | null = null;

  public constructor(options: CollisionIntersectionControlOptions) {
    this.#collisionSystem = options.collisionSystem;
    this.#sourcePolygonProvider = options.sourcePolygonProvider;
    this.#targetPolygonProvider = options.targetPolygonProvider;
    this.#onCollisionResult = options.onCollisionResult;
    this.#onStateChanged = options.onStateChanged;
  }

  public get lastResult(): PolygonCollisionResult | null {
    return this.#lastResult;
  }

  public setObservedGameObject(
    observedGameObject: CollisionObservedGameObject | null
  ): void {
    this.#observedGameObject = observedGameObject;
  }

  public clear(): void {
    this.#observedGameObject = null;
    this.#setLastResult(null);
  }

  public checkCollision(): PolygonCollisionResult | null {
    if (!this.#observedGameObject) {
      this.#setLastResult(null);
      return null;
    }

    const source = this.#sourcePolygonProvider(this.#observedGameObject);
    const target = this.#targetPolygonProvider();

    if (!source || !target) {
      this.#setLastResult(null);
      return null;
    }

    const result = this.#collisionSystem.detect({
      source,
      target,
    });

    this.#setLastResult(result);
    this.#onCollisionResult?.(result);

    return result;
  }

  #setLastResult(result: PolygonCollisionResult | null): void {
    this.#lastResult = result;
    this.#onStateChanged();
  }
}
'@

Write-Host "restored CollisionSystemReactiveController provider contract"
Write-Host "next: pnpm build"