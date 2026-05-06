# FILE: fix-keyboard-input-after-collision.ps1
# Run from:
#   Applications/game/game-scroller
#
# Then:
#   pnpm build
#   pnpm test

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

$Root = Resolve-ModuleRoot -Path $ModuleRoot
$RelativePath = "src/views/view-game-player-input.ts"
$Path = Join-ModulePath -Root $Root -RelativePath $RelativePath

if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
  throw "File not found: $RelativePath"
}

$Content = [System.IO.File]::ReadAllText($Path)

$Content = $Content.Replace(
@'
      onCollisionResult: result => {
        this.playerInputController.setEnabled(!result.hasCollide);

        if (!result.hasCollide) {
          return;
        }

        const cave = this.renderRoot.querySelector('cave-game-object');

        if (isCollisionFeedbackCave(cave)) {
          cave.flashCollision(90);
        }
      },
'@,
@'
      onCollisionResult: result => {
        if (!result.hasCollide) {
          return;
        }

        const cave = this.renderRoot.querySelector('cave-game-object');

        if (isCollisionFeedbackCave(cave)) {
          cave.flashCollision(90);
        }
      },
'@
)

$Content = $Content.Replace(
@'
      onCollisionResult: result => {
        this.playerInputController.setEnabled(!result.hasCollide);
        if (!result.hasCollide) {
          return;
        }

        const cave = this.renderRoot.querySelector('cave-game-object');

        if (isCollisionFeedbackCave(cave)) {
          cave.flashCollision(90);
        }
      },
'@,
@'
      onCollisionResult: result => {
        if (!result.hasCollide) {
          return;
        }

        const cave = this.renderRoot.querySelector('cave-game-object');

        if (isCollisionFeedbackCave(cave)) {
          cave.flashCollision(90);
        }
      },
'@
)

$Content = $Content.Replace(
  "        this.playerInputController.setEnabled(!result.hasCollide);`r`n",
  ""
)

$Content = $Content.Replace(
  "        this.playerInputController.setEnabled(!result.hasCollide);`n",
  ""
)

[System.IO.File]::WriteAllText(
  $Path,
  $Content.TrimEnd() + [Environment]::NewLine,
  $Utf8NoBom
)

Write-Host "patched $RelativePath"
Write-Host "removed collision-driven PlayerInputController disabling"
Write-Host ""
Write-Host "next:"
Write-Host "  pnpm build"
Write-Host "  pnpm test"