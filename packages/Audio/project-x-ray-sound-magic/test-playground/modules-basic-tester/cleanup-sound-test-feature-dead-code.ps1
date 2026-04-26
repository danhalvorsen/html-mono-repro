# FILE: cleanup-sound-test-feature-dead-code.ps1

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$ModuleBasicRoot = (Get-Location).Path,

    [Parameter(Mandatory = $false)]
    [switch]$Delete
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"

$SoundFeatureRoot = Join-Path $ModuleBasicRoot "src\features\soundTestFeature"
$ArchiveRoot = Join-Path $ModuleBasicRoot ".dead-code\soundTestFeature-$Stamp"

$DeadRelativePaths = @(
    "DefaultTwoOscillatorVoiceDefinition.ts",
    "fix-sound-test-melody-and-adsr-ui.ps1",
    "melody-voice-player.component.ts",
    "MelodyVoicePlayer.ts",
    "midi-song-player.component.ts",
    "songs\london-bridge.json",
    "SoundTestCompositionRoot.ts",
    "TwoOscillatorVoice.ts"
)

$ActiveIndexContent = @'
export * from "./sound-test.component.js";
export * from "./two-oscillator-demo.component.js";
export * from "./midi-controller.component.js";
export * from "./SoundController.js";
export * from "./soundTestFeature.js";
'@

function Assert-Directory {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    if (-not (Test-Path -LiteralPath $Path -PathType Container)) {
        throw "Directory not found: $Path"
    }
}

function Write-Utf8File {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [string]$Content
    )

    $normalized = $Content.TrimEnd() + [Environment]::NewLine
    [System.IO.File]::WriteAllText($Path, $normalized, $Utf8NoBom)

    Write-Host "Written: $Path"
}

function Move-Or-Delete {
    param(
        [Parameter(Mandatory = $true)]
        [string]$SourcePath,

        [Parameter(Mandatory = $true)]
        [string]$RelativePath
    )

    if (-not (Test-Path -LiteralPath $SourcePath -PathType Leaf)) {
        Write-Host "Missing, skipped: $RelativePath"
        return
    }

    if ($Delete) {
        Remove-Item -LiteralPath $SourcePath -Force
        Write-Host "Deleted: $RelativePath"
        return
    }

    $targetPath = Join-Path $ArchiveRoot $RelativePath
    $targetDirectory = Split-Path -Parent $targetPath

    if (-not (Test-Path -LiteralPath $targetDirectory -PathType Container)) {
        New-Item -ItemType Directory -Path $targetDirectory -Force | Out-Null
    }

    Move-Item -LiteralPath $SourcePath -Destination $targetPath -Force
    Write-Host "Archived: $RelativePath -> $targetPath"
}

function Remove-EmptyDirectoryIfPresent {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    if (-not (Test-Path -LiteralPath $Path -PathType Container)) {
        return
    }

    $children = @(Get-ChildItem -LiteralPath $Path -Force)

    if ($children.Count -ne 0) {
        return
    }

    Remove-Item -LiteralPath $Path -Force
    Write-Host "Removed empty directory: $Path"
}

Assert-Directory -Path $ModuleBasicRoot
Assert-Directory -Path $SoundFeatureRoot

Write-Host "Sound feature root: $SoundFeatureRoot"
Write-Host "Mode: $(if ($Delete) { 'DELETE' } else { 'ARCHIVE' })"
Write-Host ""

foreach ($relativePath in $DeadRelativePaths) {
    $sourcePath = Join-Path $SoundFeatureRoot $relativePath

    Move-Or-Delete `
        -SourcePath $sourcePath `
        -RelativePath $relativePath
}

Remove-EmptyDirectoryIfPresent -Path (Join-Path $SoundFeatureRoot "songs")

Write-Utf8File `
    -Path (Join-Path $SoundFeatureRoot "index.ts") `
    -Content $ActiveIndexContent

Write-Host ""
Write-Host "Done."
Write-Host "Run:"
Write-Host "  pnpm build"