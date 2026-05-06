# FILE: fix-game-scroller-tests.ps1
# Run from:
#   Applications/game/game-scroller
# or:
#   .\fix-game-scroller-tests.ps1 -ModuleRoot "C:\Users\danha\source\repos\HTML\MonoRepro\Applications\game\game-scroller"

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
    (Test-Path -LiteralPath (Join-Path $resolved "src") -PathType Container) -and
    (Test-Path -LiteralPath (Join-Path $resolved "tests") -PathType Container)
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

Write-ModuleFile -Root $Root -RelativePath "src/Game/Builders/SvgPolygonBuilder.ts" -Content @'
export * from '../Elements/Polygon/SvgPolygonBuilder.js';
'@

Write-ModuleFile -Root $Root -RelativePath "src/Game/Srceens/Cave/GamePolygonGeneratorController.ts" -Content @'
export * from '../../Screen/Cave/GamePolygonGeneratorController.js';
'@

Write-ModuleFile -Root $Root -RelativePath "tests/Game/GameObjectSubject.Observer.spec.ts" -Content @'
import { describe, expect, it, vi } from 'vitest';
import type { PolygonCollisionSystem } from '@monorepo/core-collision-polygons';
import { GameObjectSubject } from '../../src/Game/GameObjectSubject.js';
import {
  CollisionSystemReactiveController,
  type CollisionObservedGameObject,
} from '../../src/Game/Collision/index.js';

describe('GameObjectSubject observer behavior', () => {
  it('should publish timeAdvanced when onTime is invoked', () => {
    const subject = new GameObjectSubject();
    const observer = vi.fn();

    subject.subscribeState('timeAdvanced', observer);
    subject.onTime(100);

    expect(observer).toHaveBeenCalledTimes(1);
    expect(observer).toHaveBeenCalledWith(100);
  });

  it('should publish positionChanged when controller moves the subject', () => {
    const subject = new GameObjectSubject();
    const observer = vi.fn();

    subject.subscribeState('positionChanged', observer);
    subject.setPosistion({ x: 10, y: 20 });

    expect(observer).toHaveBeenCalledTimes(1);
    expect(observer).toHaveBeenCalledWith({ x: 10, y: 20 });
  });
});

describe('CollisionSystemReactiveController observing GameObjectSubject', () => {
  it('should subscribe to observed game object position changes', () => {
    const host = new ReactiveControllerHostFixture();

    const observed = createObservedGameObjectFixture();

    const sut = new CollisionSystemReactiveController({
      host,
      collisionSystem: createCollisionSystemFixture(),
      sourcePolygonProvider: () => null,
      targetPolygonProvider: () => null,
    });

    sut.setObservedGameObject(observed);

    expect(observed.subscribeState).toHaveBeenCalledTimes(1);
    expect(observed.subscribeState).toHaveBeenCalledWith(
      'positionChanged',
      expect.any(Function)
    );
  });
});

class ReactiveControllerHostFixture {
  public readonly addController = vi.fn();
  public readonly removeController = vi.fn();
  public readonly requestUpdate = vi.fn();
}

function createObservedGameObjectFixture(): CollisionObservedGameObject & {
  readonly subscribeState: ReturnType<typeof vi.fn>;
  readonly unsubscribeState: ReturnType<typeof vi.fn>;
} {
  return {
    onTime: vi.fn(),
    getPosistion: vi.fn(() => ({ x: 0, y: 0 })),
    setPosistion: vi.fn(),
    getWorldPosistion: vi.fn(() => ({ x: 0, y: 0 })),
    getRotation: vi.fn(() => ({ x: 0, y: 0 })),
    getWorldRotation: vi.fn(() => ({ x: 0, y: 0 })),
    subscribeState: vi.fn(() => vi.fn()),
    unsubscribeState: vi.fn(() => true),
  };
}

function createCollisionSystemFixture(): PolygonCollisionSystem {
  return {
    detect: vi.fn(),
  } as unknown as PolygonCollisionSystem;
}
'@

Write-Host "fixed stale imports and observer test"
Write-Host "next: pnpm test"