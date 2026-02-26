<# 
  git-nested-repo-scan.ps1
  Read-only scan: finds nested .git directories/files that can cause "modified content" noise.
  Does NOT delete or modify anything.
#>

[CmdletBinding()]
param(
  [Parameter()]
  [string] $Root = (Get-Location).Path
)

$ErrorActionPreference = "Stop"

Write-Host "Repo root: $Root"
Write-Host "Scanning for nested .git (excluding root .git and node_modules)..." -ForegroundColor Cyan

$rootGit = Join-Path $Root ".git"

$items =
  Get-ChildItem -Path $Root -Recurse -Force -ErrorAction SilentlyContinue |
  Where-Object {
    $_.Name -eq ".git" -and
    $_.FullName -ne $rootGit -and
    $_.FullName -notmatch "\\node_modules\\"
  } |
  Select-Object FullName, Attributes, Mode, LastWriteTime |
  Sort-Object FullName

if (-not $items) {
  Write-Host "OK: No nested .git found." -ForegroundColor Green
  exit 0
}

Write-Host ""
Write-Host "WARNING: Nested .git found (review before deleting):" -ForegroundColor Yellow
$items | Format-Table -AutoSize

Write-Host ""
Write-Host "Tip: If any of these are accidental, remove them with:" -ForegroundColor DarkGray
Write-Host "  Remove-Item -Recurse -Force <path-to-nested-.git>" -ForegroundColor DarkGray