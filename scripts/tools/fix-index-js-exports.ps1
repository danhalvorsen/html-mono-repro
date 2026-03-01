# fix-index.ps1
# Adds missing ".js" extensions to export lines in ./index.ts
#
# Default: DRY RUN (no file changes)
# Apply changes using:  -Apply

param(
    [switch]$Apply
)

$File = "./index.ts"

if (!(Test-Path $File)) {
    Write-Error "index.ts not found in current directory."
    exit 1
}

$DryRun = -not $Apply

Write-Host ""
Write-Host "Processing index.ts"
Write-Host "Mode:" ($DryRun ? "DRY-RUN (no changes written)" : "APPLY")
Write-Host ""

$regex = "^(?<prefix>\s*export\s+\*\s+from\s+['""])(?<path>[^'""]+)(?<suffix>['""]\s*;?\s*)$"

$changed = $false
$output = @()

foreach ($line in Get-Content $File) {

    if ($line -match $regex) {

        $prefix = $matches.prefix
        $path   = $matches.path
        $suffix = $matches.suffix

        if ($path -notmatch "\.(js|json|mjs|cjs|css)$") {

            $newLine = "$prefix$path.js$suffix"

            Write-Host "ADD .js:"
            Write-Host "  OLD: $line"
            Write-Host "  NEW: $newLine"
            Write-Host ""

            $output += $newLine
            $changed = $true
            continue
        }
    }

    $output += $line
}

if (-not $changed) {
    Write-Host "No changes required."
    return
}

if ($DryRun) {
    Write-Host "Dry-run complete. No files modified."
    Write-Host "Run with -Apply to write changes."
    return
}

# ---- APPLY MODE ----

Copy-Item $File "$File.bak" -Force
$output | Set-Content $File -Encoding UTF8

Write-Host ""
Write-Host "✔ index.ts updated"
Write-Host "Backup: index.ts.bak"