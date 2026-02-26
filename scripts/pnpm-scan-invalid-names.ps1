# scripts/pnpm-scan-invalid-names.ps1
# Read-only: scans package.json names for npm-valid patterns (lowercase, scoped allowed)

$ErrorActionPreference = "Stop"

$repo = (Get-Location).Path
Write-Host "Repo: $repo"
Write-Host "Scanning package.json (excluding node_modules)..."

# npm-ish name regex (lowercase only, scoped allowed)
# matches:
#   name
#   @scope/name
$validName = '^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$'

$items =
  Get-ChildItem -Recurse -Filter package.json |
  Where-Object FullName -notmatch 'node_modules'

$bad = @()

foreach ($f in $items) {
  $path = $f.FullName
  try { $j = Get-Content $path -Raw | ConvertFrom-Json } catch { continue }
  if (-not $j.name) { continue }

  $name = [string]$j.name
  if ($name -notmatch $validName) {
    $bad += [pscustomobject]@{
      Name = $name
      Path = $path
      Hint = "Must be lowercase. Example: @monorepo/multimedia"
    }
  }
}

if ($bad.Count -eq 0) {
  Write-Host "OK: No invalid package names found."
} else {
  Write-Host ""
  Write-Host "INVALID PACKAGE NAMES FOUND:"
  $bad | Sort-Object Name | Format-Table -AutoSize
  exit 2
}