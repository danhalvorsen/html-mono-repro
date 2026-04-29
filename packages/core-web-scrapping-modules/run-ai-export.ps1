# run-ai-export.ps1
# Can be started from anywhere inside the mono repo.
# The export script is resolved from repo root.
# The working directory remains where this script was executed.

$ErrorActionPreference = "Stop"

function Find-MonoRepoRoot {
    param(
        [Parameter(Mandatory = $true)]
        [string] $StartDirectory
    )

    $current = Resolve-Path $StartDirectory

    while ($null -ne $current) {
        $packageJson = Join-Path $current.Path "package.json"
        $pnpmWorkspace = Join-Path $current.Path "pnpm-workspace.yaml"
        $exportScript = Join-Path $current.Path "scripts\code-sharing\export-npm-modules-for-ai.ps1"

        if (
            (Test-Path $packageJson) -and
            (Test-Path $pnpmWorkspace) -and
            (Test-Path $exportScript)
        ) {
            return $current.Path
        }

        $parent = Split-Path $current.Path -Parent

        if ([string]::IsNullOrWhiteSpace($parent) -or $parent -eq $current.Path) {
            break
        }

        $current = Resolve-Path $parent
    }

    throw "Could not find mono repo root from '$StartDirectory'."
}

$executionDirectory = (Get-Location).Path
$repoRoot = Find-MonoRepoRoot -StartDirectory $executionDirectory
$scriptPath = Join-Path $repoRoot "scripts\code-sharing\export-npm-modules-for-ai.ps1"

Write-Host "Execution directory: $executionDirectory"
Write-Host "Repo root: $repoRoot"
Write-Host "Running: $scriptPath"

# Preserve caller working directory.
& $scriptPath @args

if ($null -ne $LASTEXITCODE -and $LASTEXITCODE -ne 0) {
    throw "Export script failed with exit code $LASTEXITCODE."
}