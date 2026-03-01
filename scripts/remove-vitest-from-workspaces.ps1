# scripts/remove-vitest-from-workspaces.ps1
#
# Scans only:
#   1) .\Applications\**\package.json
#   2) .\packages\**\package.json
#
# Removes from each found package.json:
#   vitest, @vitest/ui, @vitest/coverage-v8
#   from: dependencies, devDependencies, optionalDependencies, peerDependencies
#
# Default = DRY RUN (no writes)
#
# Usage (from repo root):
#   pwsh .\scripts\remove-vitest-from-workspaces.ps1
#   pwsh .\scripts\remove-vitest-from-workspaces.ps1 -Apply
#   pwsh .\scripts\remove-vitest-from-workspaces.ps1 -Check
#   pwsh .\scripts\remove-vitest-from-workspaces.ps1 -Apply -Verbose

param(
    [switch]$Apply,
    [switch]$Check,
    [switch]$Verbose
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# -----------------------------
# Policy configuration
# -----------------------------
$Targets = @("vitest", "@vitest/ui", "@vitest/coverage-v8")
$Sections = @("dependencies", "devDependencies", "optionalDependencies", "peerDependencies")

$RepoRoot = Get-Location

$ScanRoots = @(
    Join-Path $RepoRoot "Applications",
    Join-Path $RepoRoot "packages"
) | Where-Object { Test-Path $_ }

if ($ScanRoots.Count -eq 0) {
    throw "Expected folders not found. Must run from repo root with .\Applications and .\packages present."
}

# Exclusions (avoid scanning junk)
$ExcludeRegex = "\\node_modules\\|\\dist\\|\\build\\|\\\.git\\|\\\.pnpm\\|\\\.turbo\\|\\\.vite\\"

function Get-PackageJsonFiles([string]$rootDir) {
    Get-ChildItem -Path $rootDir -Recurse -File -Filter "package.json" |
        Where-Object { $_.FullName -notmatch $ExcludeRegex }
}

function Remove-TargetsFromSection([pscustomobject]$json, [string]$sectionName, [ref]$removedCount) {
    if (-not $json.PSObject.Properties.Name.Contains($sectionName)) { return }

    $deps = $json.$sectionName
    if ($null -eq $deps) { return }

    foreach ($t in $Targets) {
        if ($deps.PSObject.Properties.Name -contains $t) {
            $deps.PSObject.Properties.Remove($t)
            $removedCount.Value++
        }
    }

    if ($deps.PSObject.Properties.Count -eq 0) {
        $json.PSObject.Properties.Remove($sectionName)
    }
}

function Process-PackageJson([System.IO.FileInfo]$file) {
    $raw = Get-Content -LiteralPath $file.FullName -Raw

    try {
        $json = $raw | ConvertFrom-Json
    } catch {
        if ($Verbose) { Write-Warning "Skipping invalid JSON: $($file.FullName)" }
        return $null
    }

    $removed = 0
    foreach ($section in $Sections) {
        Remove-TargetsFromSection -json $json -sectionName $section -removedCount ([ref]$removed)
    }

    if ($removed -le 0) { return $null }

    # Relative display path
    $relative = Resolve-Path -LiteralPath $file.FullName -Relative

    if ($Verbose) {
        Write-Host ("{0} {1} (-{2})" -f ($(if ($Apply) { "UPDATED" } else { "FOUND " }), $relative, $removed))
    }

    if ($Apply) {
        # Deterministic output; ConvertTo-Json uses 2-space indent.
        $json | ConvertTo-Json -Depth 200 | Set-Content -LiteralPath $file.FullName -Encoding UTF8
    }

    return [pscustomobject]@{
        File    = $relative
        Removed = $removed
    }
}

# -----------------------------
# Run
# -----------------------------
$allFiles = @()
foreach ($root in $ScanRoots) {
    $allFiles += Get-PackageJsonFiles -rootDir $root
}

$changes = New-Object System.Collections.Generic.List[object]
$totalRemoved = 0

foreach ($f in $allFiles) {
    $result = Process-PackageJson -file $f
    if ($null -ne $result) {
        $changes.Add($result) | Out-Null
        $totalRemoved += [int]$result.Removed
    }
}

$mode = $(if ($Apply) { "APPLY" } elseif ($Check) { "CHECK" } else { "DRY-RUN" })

Write-Host ""
Write-Host "Mode:          $mode"
Write-Host "Scanned files: $($allFiles.Count)"
Write-Host "Affected:      $($changes.Count)"
Write-Host "Removed:       $totalRemoved"

if ($changes.Count -gt 0 -and -not $Verbose) {
    Write-Host "`nAffected files:"
    foreach ($c in $changes) {
        Write-Host (" - {0} (-{1})" -f $c.File, $c.Removed)
    }
}

if ($Check -and $changes.Count -gt 0) {
    throw "Root-only Vitest policy violated (vitest deps found under Applications/ or packages/)."
}

if (-not $Apply -and -not $Check) {
    Write-Host "`nDRY RUN complete. Re-run with -Apply to write changes."
}