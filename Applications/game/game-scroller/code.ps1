# FILE: fix-color-mangment-target-discovery.ps1
# RUN FROM:
# C:\Users\danha\source\repos\HTML\MonoRepro\Applications\game\game-scroller

param(
    [switch] $Build
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$moduleRoot = (Get-Location).Path
$targetPath = Join-Path $moduleRoot "src\ColorMangment\ColorMangment.ts"

if (-not (Test-Path (Join-Path $moduleRoot "package.json"))) {
    throw "Run from game-scroller module root."
}

if (-not (Test-Path $targetPath)) {
    throw "Missing file: $targetPath"
}

$content = [System.IO.File]::ReadAllText($targetPath)

$old = @'
  #getTargets(): readonly ColorMangmentTargetElement[] {
    return this.assignedElements.filter(
      (element): element is ColorMangmentTargetElement =>
        element instanceof BaseGameObject,
    );
  }
'@

$new = @'
  #getTargets(): readonly ColorMangmentTargetElement[] {
    const targets: ColorMangmentTargetElement[] = [];

    for (const assignedElement of this.assignedElements) {
      this.#collectTargets(assignedElement, targets);
    }

    return targets;
  }

  #collectTargets(
    element: Element,
    targets: ColorMangmentTargetElement[],
  ): void {
    if (element instanceof BaseGameObject) {
      targets.push(element as ColorMangmentTargetElement);
      return;
    }

    const descendants = element.querySelectorAll("*");

    for (const descendant of descendants) {
      if (descendant instanceof BaseGameObject) {
        targets.push(descendant as ColorMangmentTargetElement);
      }
    }
  }
'@

if (-not $content.Contains($old)) {
    throw "Expected #getTargets block was not found. Refusing unsafe patch."
}

$content = $content.Replace($old, $new)

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($targetPath, $content, $utf8NoBom)

Write-Host "Patched: $targetPath"

if ($Build.IsPresent) {
    pnpm build
}