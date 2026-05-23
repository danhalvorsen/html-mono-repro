param(
  [Parameter(Mandatory = $true)]
  [string]$Name,

  [string]$ViewId = "",

  [string]$RootName = ""
)

$ErrorActionPreference = "Stop"

function To-PascalCase([string]$value) {
  $parts = ($value -replace "[^a-zA-Z0-9]+", " ").Trim().Split(" ", [System.StringSplitOptions]::RemoveEmptyEntries)
  if ($parts.Count -eq 0) {
    throw "Name must contain at least one alphanumeric character."
  }

  return ($parts | ForEach-Object {
      if ($_.Length -eq 1) { $_.ToUpper() }
      else { $_.Substring(0,1).ToUpper() + $_.Substring(1).ToLower() }
    }) -join ""
}

function To-KebabCase([string]$value) {
  $clean = ($value -creplace "([a-z0-9])([A-Z])", '$1-$2')
  $clean = ($clean -replace "[^a-zA-Z0-9]+", "-").Trim("-")
  if ([string]::IsNullOrWhiteSpace($clean)) {
    throw "Name must contain at least one alphanumeric character."
  }

  return $clean.ToLowerInvariant()
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$pascal = To-PascalCase $Name
$kebab = To-KebabCase $Name

if ([string]::IsNullOrWhiteSpace($ViewId)) {
  $ViewId = $kebab
}

if ([string]::IsNullOrWhiteSpace($RootName)) {
  $RootName = "$kebab-root"
}

$sceneClassName = "${pascal}PlaygroundScene"
$targetDir = Join-Path $scriptDir $kebab
$targetFile = Join-Path $targetDir "$sceneClassName.ts"
if (-not (Test-Path $targetFile)) {
  New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
}

$sceneContent = @"
import * as THREE from "three";
import type { IMaterialFactory } from "@monorepo/core-threejs-app-framework/src/Materials/IMaterialFactory.js";
import { MaterialToken } from "@monorepo/core-threejs-app-framework/src/Materials/MaterialToken.js";
import type { IThreeScene } from "../../IThreeScene.js";
import { PlaygroundSceneBase } from "../../common/PlaygroundSceneBase.ts";

export class $sceneClassName extends PlaygroundSceneBase {
  public constructor(
    scene: IThreeScene,
    materialFactory: IMaterialFactory,
    viewId = "$ViewId",
  ) {
    super(scene, "$RootName", materialFactory, viewId);
  }

  protected override createContent(): void {
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(2, 2, 2),
      this.materialFactory.create(MaterialToken.BuildingBlue),
    );

    box.position.set(0, 1, 0);
    box.castShadow = true;
    box.receiveShadow = true;

    this.addToRoot(box, new THREE.AxesHelper(4));
  }
}
"@

if (-not (Test-Path $targetFile)) {
  $sceneContent | Set-Content -Path $targetFile -Encoding UTF8
}

function Register-PlaygroundInManifest {
  param(
    [string]$repoRoot,
    [string]$className,
    [string]$kebabName,
    [string]$viewIdValue
  )

  $manifestPath = Join-Path $repoRoot "src/three/scene/playgrounds/playgroundPlugins.ts"
  if (-not (Test-Path $manifestPath)) {
    Write-Warning "Could not find playground manifest at: $manifestPath"
    return
  }

  $content = Get-Content -Path $manifestPath -Raw
  $importLine = "import { $className } from `"./$kebabName/$className`";"
  if (-not $content.Contains($importLine)) {
    $lines = Get-Content -Path $manifestPath
    $importInsertIndex = -1
    for ($i = 0; $i -lt $lines.Count; $i += 1) {
      if ($lines[$i] -match '^import ') {
        $importInsertIndex = $i
      }
    }
    if ($importInsertIndex -ge 0) {
      $newLines = @()
      if ($importInsertIndex -gt 0) {
        $newLines += $lines[0..$importInsertIndex]
      } else {
        $newLines += $lines[0]
      }
      $newLines += $importLine
      if ($importInsertIndex + 1 -lt $lines.Count) {
        $newLines += $lines[($importInsertIndex + 1)..($lines.Count - 1)]
      }
      Set-Content -Path $manifestPath -Value ($newLines -join "`r`n")
      $content = Get-Content -Path $manifestPath -Raw
    }
  }

  $entryBlock = @"
  {
    id: "$viewIdValue",
    label: "$className",
    create: ({ scene, materialFactory }) =>
      new $className(scene, materialFactory, "$viewIdValue"),
  },
"@

  if (-not $content.Contains("`"$className`"")) {
    $marker = "];"
    if ($content.Contains($marker)) {
      $content = $content.Replace($marker, $entryBlock + $marker)
      Set-Content -Path $manifestPath -Value $content
    } else {
      Write-Warning "Could not find manifest terminator in playgroundPlugins.ts. Add manifest entry manually."
    }
  }
}

$repoRoot = Resolve-Path (Join-Path $scriptDir "../..")
Register-PlaygroundInManifest -repoRoot $repoRoot -className $sceneClassName -kebabName $kebab -viewIdValue $ViewId

Write-Host "Created playground scene:" -ForegroundColor Green
Write-Host "  $targetFile"
Write-Host ""
Write-Host "playgroundPlugins.ts auto-updated with import + plugin entry (if missing)." -ForegroundColor Green
if (Test-Path $targetFile) {
  Write-Host "Note: if scene already existed, only manifest registration was applied." -ForegroundColor Yellow
}
