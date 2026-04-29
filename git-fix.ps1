# FILE: git-fix.ps1
[CmdletBinding()]
param(
    [switch]$Apply,
    [switch]$Commit,
    [string]$CommitMessage = "5 playwright tests for voice"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-GitRoot {
    $root = (& git rev-parse --show-toplevel 2>$null)

    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($root)) {
        throw "Not inside a Git repository."
    }

    return $root.Trim()
}

function Invoke-Git {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Arguments
    )

    if (-not $Apply) {
        Write-Host "[dry-run] git $($Arguments -join ' ')"
        return
    }

    & git @Arguments

    if ($LASTEXITCODE -ne 0) {
        throw "git $($Arguments -join ' ') failed."
    }
}

function Ensure-GitIgnorePattern {
    param(
        [Parameter(Mandatory = $true)]
        [string]$GitIgnorePath,

        [Parameter(Mandatory = $true)]
        [string]$Pattern
    )

    if (-not (Test-Path -LiteralPath $GitIgnorePath)) {
        if ($Apply) {
            New-Item -ItemType File -Path $GitIgnorePath -Force | Out-Null
        }
        else {
            Write-Host "[dry-run] create .gitignore"
        }
    }

    $content = ""
    if (Test-Path -LiteralPath $GitIgnorePath) {
        $content = Get-Content -LiteralPath $GitIgnorePath -Raw -ErrorAction SilentlyContinue
        if ($null -eq $content) {
            $content = ""
        }
    }

    $lines = $content -split "`r?`n"

    if ($lines -contains $Pattern) {
        return
    }

    if (-not $Apply) {
        Write-Host "[dry-run] add to .gitignore: $Pattern"
        return
    }

    if ($content.Length -gt 0 -and -not $content.EndsWith("`n")) {
        Add-Content -LiteralPath $GitIgnorePath -Value ""
    }

    Add-Content -LiteralPath $GitIgnorePath -Value $Pattern
}

function Restore-TrackedFileIfExists {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RelativePath
    )

    & git ls-files --error-unmatch -- $RelativePath *> $null

    if ($LASTEXITCODE -eq 0) {
        Invoke-Git -Arguments @("restore", "--", $RelativePath)
    }
}

function Add-FileIfExists {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RelativePath
    )

    if (Test-Path -LiteralPath $RelativePath -PathType Leaf) {
        Invoke-Git -Arguments @("add", "--", $RelativePath)
    }
}

function Test-IsBlockedFile {
    param(
        [Parameter(Mandatory = $true)]
        [System.IO.FileInfo]$File
    )

    $normalizedFullPath = $File.FullName.Replace("\", "/")

    $blockedPathParts = @(
        ".backup",
        ".ai-share",
        "test-results",
        "playwright-report",
        "blob-report"
    )

    foreach ($blockedPart in $blockedPathParts) {
        if ($normalizedFullPath.Contains("/$blockedPart/")) {
            return $true
        }
    }

    $blockedExtensions = @(
        ".bak",
        ".tmp",
        ".log"
    )

    if ($blockedExtensions -contains $File.Extension) {
        return $true
    }

    if ($File.Name -like "*.tsbuildinfo") {
        return $true
    }

    return $false
}

function Add-FilesUnderPath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RelativePath
    )

    if (-not (Test-Path -LiteralPath $RelativePath -PathType Container)) {
        return
    }

    $files = Get-ChildItem -LiteralPath $RelativePath -File -Recurse

    foreach ($file in $files) {
        if (Test-IsBlockedFile -File $file) {
            Write-Host "[skip] $($file.FullName)"
            continue
        }

        $repoRelativePath = Resolve-Path -LiteralPath $file.FullName -Relative
        $repoRelativePath = $repoRelativePath.TrimStart(".", "\", "/").Replace("\", "/")

        Invoke-Git -Arguments @("add", "--", $repoRelativePath)
    }
}

$repoRoot = Get-GitRoot
Push-Location $repoRoot

try {
    Write-Host "Repo root: $repoRoot"

    # Revokes all previous bad staging. Does not delete working files.
    Invoke-Git -Arguments @("reset", "--")

    $gitIgnorePath = Join-Path $repoRoot ".gitignore"

    $ignorePatterns = @(
        "*.tsbuildinfo",
        "*.bak",
        "*.tmp",
        "*.log",
        ".backup/",
        "**/.backup/",
        ".ai-share/",
        "**/.ai-share/",
        "test-results/",
        "**/test-results/",
        "playwright-report/",
        "**/playwright-report/",
        "blob-report/",
        "**/blob-report/"
    )

    foreach ($pattern in $ignorePatterns) {
        Ensure-GitIgnorePattern -GitIgnorePath $gitIgnorePath -Pattern $pattern
    }

    $generatedTrackedFiles = @(
        "packages/Audio/music-note-sheet-abstract/tsconfig.tsbuildinfo",
        "packages/Audio/music-note-sheet-dom/tsconfig.tsbuildinfo",
        "packages/core-pdf-reader/tests/PID/PID.fragments.json"
    )

    foreach ($file in $generatedTrackedFiles) {
        Restore-TrackedFileIfExists -RelativePath $file
    }

    $exactFiles = @(
        ".gitignore",
        "pnpm-lock.yaml",

        "packages/Audio/project-x-ray-sound-magic/music-core-synthesizer/modules/music-core-synthesizer-filters-contracts/package.json",
        "packages/Audio/project-x-ray-sound-magic/music-core-synthesizer/modules/music-core-synthesizer-midi-contracts/package.json",
        "packages/Audio/project-x-ray-sound-magic/music-core-synthesizer/modules/music-core-synthesizer-modulation-contracts/package.json",
        "packages/Audio/project-x-ray-sound-magic/music-core-synthesizer/modules/music-core-synthesizer-noise-contracts/package.json",
        "packages/Audio/project-x-ray-sound-magic/music-core-synthesizer/modules/music-core-synthesizer-parameters-contracts/package.json",

        "packages/Audio/project-x-ray-sound-magic/music-core-synthesizer/modules/music-core-synthesizer-oscillators-web-ui/package.json",
        "packages/Audio/project-x-ray-sound-magic/music-core-synthesizer/modules/music-core-synthesizer-oscillators-web-ui/src/index.ts",
        "packages/Audio/project-x-ray-sound-magic/music-core-synthesizer/modules/music-core-synthesizer-oscillators-web-ui/src/oscillator-control.component.ts",
        "packages/Audio/project-x-ray-sound-magic/music-core-synthesizer/modules/music-core-synthesizer-oscillators-web-ui/tsconfig.json",

        "packages/Audio/project-x-ray-sound-magic/music-core-synthesizer/modules/music-core-synthesizer-voice-contracts/package.json",
        "packages/Audio/project-x-ray-sound-magic/music-core-synthesizer/modules/music-core-synthesizer-voice-contracts/src/code.ts",
        "packages/Audio/project-x-ray-sound-magic/music-core-synthesizer/modules/music-core-synthesizer-voice-contracts/src/index.ts",

        "packages/Audio/project-x-ray-sound-magic/music-core-synthesizer/modules/music-core-synthesizer-voice/package.json",
        "packages/Audio/project-x-ray-sound-magic/music-core-synthesizer/modules/music-core-synthesizer-voice/src/DefaultVoiceDefinitionFactory.ts",
        "packages/Audio/project-x-ray-sound-magic/music-core-synthesizer/modules/music-core-synthesizer-voice/src/code.ts",
        "packages/Audio/project-x-ray-sound-magic/music-core-synthesizer/modules/music-core-synthesizer-voice/src/index.ts",

        "packages/Audio/project-x-ray-sound-magic/music-core-synthesizer/modules/music-core-synthesizer-voice-ui/src/voice-control.component.ts",

        "packages/Audio/project-x-ray-sound-magic/music-core-synthesizer/modules/music-core-synthesizer-voice-playwrigth/package.json",
        "packages/Audio/project-x-ray-sound-magic/music-core-synthesizer/modules/music-core-synthesizer-voice-playwrigth/playwright.config.ts",
        "packages/Audio/project-x-ray-sound-magic/music-core-synthesizer/modules/music-core-synthesizer-voice-playwrigth/tsconfig.json",

        "packages/Audio/project-x-ray-sound-magic/music-core-synthesizer/modules/playwrigth-test-design.puml"
    )

    foreach ($file in $exactFiles) {
        Add-FileIfExists -RelativePath $file
    }

    Add-FilesUnderPath -RelativePath "packages/Audio/project-x-ray-sound-magic/music-core-synthesizer/modules/music-core-synthesizer-voice-playwrigth/tests"

    Write-Host ""
    Write-Host "Staged files:"
    if ($Apply) {
        & git diff --cached --name-only
    }
    else {
        Write-Host "[dry-run] no files staged"
    }

    Write-Host ""
    Write-Host "Blocked staged files check:"
    if ($Apply) {
        & git diff --cached --name-only | Select-String "test-results|playwright-report|blob-report|\.tsbuildinfo|\.backup|\.ai-share|\.bak|\.tmp|\.log"
    }
    else {
        Write-Host "[dry-run] run with -Apply to validate staged files"
    }

    if ($Commit) {
        if (-not $Apply) {
            throw "Use -Apply with -Commit."
        }

        Invoke-Git -Arguments @("commit", "-m", $CommitMessage)
    }
}
finally {
    Pop-Location
}