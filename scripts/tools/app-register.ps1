# app-register.ps1

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Resolve-MonorepoRoot {
    param([Parameter(Mandatory)] [string]$StartDir)

    $dir = (Resolve-Path $StartDir).Path

    while ($true) {
        $pnpmWs = Join-Path $dir "pnpm-workspace.yaml"
        $pkgJson = Join-Path $dir "package.json"

        if (Test-Path $pnpmWs -PathType Leaf) { return $dir }
        if (Test-Path $pkgJson -PathType Leaf) { return $dir }

        $parent = Split-Path $dir -Parent
        if ([string]::IsNullOrWhiteSpace($parent) -or ($parent -eq $dir)) {
            throw "Monorepo root not found walking up from: $StartDir (expected pnpm-workspace.yaml or package.json)"
        }

        $dir = $parent
    }
}

# ✅ Start from the script folder, then walk up to monorepo root
$RepoRoot = Resolve-MonorepoRoot -StartDir $PSScriptRoot
$ApplicationsRoot = Join-Path $RepoRoot "Applications"

if (!(Test-Path $ApplicationsRoot -PathType Container)) {
    throw "Applications folder not found: $ApplicationsRoot"
}

Write-Host "RepoRoot: $RepoRoot"
Write-Host "ApplicationsRoot: $ApplicationsRoot"