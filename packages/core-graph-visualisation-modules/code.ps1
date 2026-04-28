# code.fix.ps1
[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$Root = (Get-Location).Path,

    [Parameter(Mandatory = $false)]
    [switch]$RunBuild
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Join-PathMany {
    param([Parameter(Mandatory = $true)][string[]]$Parts)

    $current = $Parts[0]

    for ($index = 1; $index -lt $Parts.Count; $index++) {
        $current = Join-Path $current $Parts[$index]
    }

    return $current
}

function Read-TextFile {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        throw "Missing file: $Path"
    }

    return [System.IO.File]::ReadAllText($Path)
}

function Write-TextFile {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Content
    )

    [System.IO.File]::WriteAllText($Path, $Content, [System.Text.UTF8Encoding]::new($false))
}

function Backup-File {
    param([Parameter(Mandatory = $true)][string]$Path)

    $backupPath = "$Path.bak"

    if (-not (Test-Path -LiteralPath $backupPath)) {
        Copy-Item -LiteralPath $Path -Destination $backupPath -Force
    }
}

function Find-ModuleDirectory {
    param(
        [Parameter(Mandatory = $true)][string]$SearchRoot,
        [Parameter(Mandatory = $true)][string]$ModuleName
    )

    $directCandidates = @(
        (Join-PathMany @($SearchRoot, $ModuleName)),
        (Join-PathMany @($SearchRoot, "packages", "core-graph-visualisation-modules", $ModuleName))
    )

    foreach ($candidate in $directCandidates) {
        if (Test-Path -LiteralPath $candidate -PathType Container) {
            return (Resolve-Path -LiteralPath $candidate).Path
        }
    }

    $found = Get-ChildItem -LiteralPath $SearchRoot -Directory -Recurse |
        Where-Object { $_.Name -eq $ModuleName } |
        Select-Object -First 1

    if ($null -eq $found) {
        throw "Could not find module directory '$ModuleName' under '$SearchRoot'."
    }

    return $found.FullName
}

function Find-FileByContent {
    param(
        [Parameter(Mandatory = $true)][string]$Directory,
        [Parameter(Mandatory = $true)][string[]]$RequiredFragments
    )

    $files = Get-ChildItem -LiteralPath $Directory -Recurse -File -Include *.ts,*.tsx

    foreach ($file in $files) {
        $content = Read-TextFile $file.FullName
        $matchesAll = $true

        foreach ($fragment in $RequiredFragments) {
            if (-not $content.Contains($fragment)) {
                $matchesAll = $false
                break
            }
        }

        if ($matchesAll) {
            return $file.FullName
        }
    }

    throw "Could not find file under '$Directory' containing: $($RequiredFragments -join ', ')"
}

function Replace-Once {
    param(
        [Parameter(Mandatory = $true)][string]$Content,
        [Parameter(Mandatory = $true)][string]$Search,
        [Parameter(Mandatory = $true)][string]$Replacement,
        [Parameter(Mandatory = $true)][string]$AlreadyDone,
        [Parameter(Mandatory = $true)][string]$Name
    )

    if ($Content.Contains($AlreadyDone)) {
        return $Content
    }

    if (-not $Content.Contains($Search)) {
        throw "Patch failed: $Name"
    }

    return $Content.Replace($Search, $Replacement)
}

function Insert-Before {
    param(
        [Parameter(Mandatory = $true)][string]$Content,
        [Parameter(Mandatory = $true)][string]$Marker,
        [Parameter(Mandatory = $true)][string]$Insertion,
        [Parameter(Mandatory = $true)][string]$AlreadyDone,
        [Parameter(Mandatory = $true)][string]$Name
    )

    if ($Content.Contains($AlreadyDone)) {
        return $Content
    }

    $index = $Content.IndexOf($Marker, [System.StringComparison]::Ordinal)

    if ($index -lt 0) {
        throw "Patch failed: $Name"
    }

    return $Content.Insert($index, $Insertion)
}

function Patch-NodeShapeContract {
    param([Parameter(Mandatory = $true)][string]$Path)

    Backup-File $Path
    $content = Read-TextFile $Path

    $content = Replace-Once `
        -Content $content `
        -Search 'export type GraphNodeVisualRepresentation = "box" | "circle";' `
        -Replacement 'export type GraphNodeVisualRepresentation = "box" | "circle" | "node";' `
        -AlreadyDone 'export type GraphNodeVisualRepresentation = "box" | "circle" | "node";' `
        -Name "Add node representation type."

    Write-TextFile -Path $Path -Content $content
}

function Patch-SceneFactory {
    param([Parameter(Mandatory = $true)][string]$Path)

    Backup-File $Path
    $content = Read-TextFile $Path

    $nodeCenterPointBlock = @'
    if (representation === "node") {
      return [
        {
          id: `${nodeId}-center`,
          role: "center",
          connector: { x: center.x, y: center.y },
        },
      ];
    }

'@

    $content = Insert-Before `
        -Content $content `
        -Marker '    if (representation === "circle" && circle !== undefined) {' `
        -Insertion $nodeCenterPointBlock `
        -AlreadyDone 'id: `${nodeId}-center`' `
        -Name "Create one center connection point for node representation."

    $content = Replace-Once `
        -Content $content `
        -Search @'
    const representation = record.representation === "circle"
      || record.representation === "box"
      ? record.representation
      : undefined;
'@ `
        -Replacement @'
    const representation = record.representation === "circle"
      || record.representation === "box"
      || record.representation === "node"
      ? record.representation
      : undefined;
'@ `
        -AlreadyDone '|| record.representation === "node"' `
        -Name "Allow payload visual.representation node."

    Write-TextFile -Path $Path -Content $content
}

function Patch-Toolbar {
    param([Parameter(Mandatory = $true)][string]$Path)

    Backup-File $Path
    $content = Read-TextFile $Path

    $content = Replace-Once `
        -Content $content `
        -Search '          <option value="circle">Circle</option>' `
        -Replacement @'
          <option value="circle">Circle</option>
          <option value="node">Node</option>
'@.TrimEnd() `
        -AlreadyDone '<option value="node">Node</option>' `
        -Name "Add Node option to toolbar."

    $content = Replace-Once `
        -Content $content `
        -Search '    if (select.value !== "box" && select.value !== "circle") {' `
        -Replacement '    if (select.value !== "box" && select.value !== "circle" && select.value !== "node") {' `
        -AlreadyDone 'select.value !== "node"' `
        -Name "Allow node in toolbar guard."

    Write-TextFile -Path $Path -Content $content
}

function Invoke-ModuleBuild {
    param([Parameter(Mandatory = $true)][string]$ModulePath)

    Push-Location $ModulePath
    try {
        pnpm build
        if ($LASTEXITCODE -ne 0) {
            throw "Build failed: $ModulePath"
        }
    }
    finally {
        Pop-Location
    }
}

$resolvedRoot = (Resolve-Path -LiteralPath $Root).Path

$coreModule = Find-ModuleDirectory -SearchRoot $resolvedRoot -ModuleName "core-graph-visualisation"
$appModule = Find-ModuleDirectory -SearchRoot $resolvedRoot -ModuleName "application-graph-vizualisation"

$nodeShapeFile = Join-PathMany @($coreModule, "src", "features", "node", "NodeSvgShape.ts")

$sceneFactoryFile = Find-FileByContent `
    -Directory $coreModule `
    -RequiredFragments @(
        "private createConnectionPoints(",
        "private resolveNodeVisualDefinition(",
        "record.representation === `"circle`""
    )

$toolbarFile = Join-PathMany @($appModule, "src", "components", "GraphVisualizationToolbar.ts")

Patch-NodeShapeContract -Path $nodeShapeFile
Patch-SceneFactory -Path $sceneFactoryFile
Patch-Toolbar -Path $toolbarFile

Write-Host "Patched Node shape with one center connection point."
Write-Host "Core:        $coreModule"
Write-Host "Application: $appModule"

if ($RunBuild) {
    Invoke-ModuleBuild -ModulePath $coreModule
    Invoke-ModuleBuild -ModulePath $appModule
}