# ------------------------------------------------------------
# build-and-show-errors.ps1
# Robust pnpm workspace build + error extractor
# ZERO fragile .NET process code
# ------------------------------------------------------------

param(
    [string]$RepoRoot = (Resolve-Path ".").Path
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ------------------------------------------------------------
# paths
# ------------------------------------------------------------

$log = Join-Path $RepoRoot ".build-full.log"
$err = Join-Path $RepoRoot ".build-errors.log"

Remove-Item $log,$err -ErrorAction Ignore

# ------------------------------------------------------------
# ui helpers
# ------------------------------------------------------------

function Section($t) {
    Write-Host ""
    Write-Host ("═"*60) -ForegroundColor DarkGray
    Write-Host ("  $t") -ForegroundColor Cyan
    Write-Host ("═"*60) -ForegroundColor DarkGray
}

function Package($n) {
    Write-Host ""
    Write-Host ("PACKAGE: $n") -ForegroundColor Yellow
}

function Err($type,$msg) {
    Write-Host ("  {0,-12} {1}" -f $type,$msg) -ForegroundColor Red
}

# ------------------------------------------------------------
# error patterns
# ------------------------------------------------------------

$patterns = @{
    TypeScript = "TS\d{4}"
    Module     = "Cannot find module"
    PNPM       = "ERR_PNPM"
    Lifecycle  = "ELIFECYCLE"
    Generic    = "^\s*Error:"
}

# ------------------------------------------------------------
# build
# ------------------------------------------------------------

Section "Running workspace build"

$currentPackage = "unknown"
$results = New-Object System.Collections.Generic.List[object]

# run pnpm normally (NO custom process API)
pnpm --aggregate-output -r run build *>&1 |
ForEach-Object {

    $line = "$_"

    # write full log (never crash on IO)
    try { Add-Content $log $line } catch {}

    # detect package
    if ($line -match "^(?<pkg>.+?) build\$") {
        $currentPackage = $Matches.pkg.Trim()
        Write-Host ""
        Write-Host ("▶ BUILDING: $currentPackage") -ForegroundColor Cyan
        return
    }

    # detect errors
    foreach ($k in $patterns.Keys) {
        if ($line -match $patterns[$k]) {

            $results.Add([pscustomobject]@{
                Package = $currentPackage
                Type    = $k
                Message = $line.Trim()
            })

            break
        }
    }
}

$pnpmExit = $LASTEXITCODE

# ------------------------------------------------------------
# normalize results safely
# ------------------------------------------------------------

$resultsArr = @(
    $results.ToArray() |
    Sort-Object Package,Type,Message -Unique
)

# ------------------------------------------------------------
# success
# ------------------------------------------------------------

if ($resultsArr.Count -eq 0 -and $pnpmExit -eq 0) {
    Write-Host ""
    Write-Host "✔ BUILD SUCCESS — no errors detected" -ForegroundColor Green
    exit 0
}

# fallback if pnpm failed but pattern missed it
if ($resultsArr.Count -eq 0) {
    $resultsArr = @(
        [pscustomobject]@{
            Package="workspace"
            Type="PNPM"
            Message="Build failed (exit code $pnpmExit). See full log."
        }
    )
}

# save error log
try {
    $resultsArr | ConvertTo-Json -Depth 4 | Set-Content $err
} catch {}

# ------------------------------------------------------------
# output
# ------------------------------------------------------------

Section "BUILD ERRORS FOUND"

$grouped = $resultsArr | Group-Object Package

foreach ($g in $grouped) {
    Package $g.Name
    foreach ($e in $g.Group) {
        Err $e.Type $e.Message
    }
}

Section "SUMMARY"

Write-Host ("Packages failed : " + $grouped.Count)
Write-Host ("Errors detected : " + $resultsArr.Count)
Write-Host ("pnpm exit code  : " + $pnpmExit)

Write-Host ""
Write-Host ("Full log : $log") -ForegroundColor DarkGray
Write-Host ("Error log: $err") -ForegroundColor DarkGray

if ($pnpmExit -ne 0) { exit $pnpmExit }
exit 1