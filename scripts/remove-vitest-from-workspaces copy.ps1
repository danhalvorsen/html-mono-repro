# scripts/remove-vitest-from-workspaces.ps1
# Default: DRY-RUN (no writes). Use -Apply to write. Use -Check to fail if any violations.

[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = "Medium")]
param(
  [switch]$Apply,
  [switch]$Check
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Targets  = @("vitest", "@vitest/ui", "@vitest/coverage-v8")
$Sections = @("dependencies", "devDependencies", "optionalDependencies", "peerDependencies")

$RepoRootPath = (Get-Location).Path.TrimEnd('\','/')

$ScanRoots = @(
  (Join-Path -Path $RepoRootPath -ChildPath "Applications"),
  (Join-Path -Path $RepoRootPath -ChildPath "packages")
) | Where-Object { Test-Path $_ }

if (@($ScanRoots).Count -eq 0) {
  throw "Expected .\Applications and/or .\packages under repo root. Run from repo root."
}

$ExcludeRegex = "(\\|/)(node_modules|dist|build|\.git|\.pnpm|\.turbo|\.vite)(\\|/)"

function Get-RelativePath([string]$absPath) {
  if ($absPath.StartsWith($RepoRootPath, [System.StringComparison]::OrdinalIgnoreCase)) {
    return $absPath.Substring($RepoRootPath.Length).TrimStart('\','/')
  }
  return $absPath
}

function Get-PackageJsonFiles([string]$rootDir) {
  Get-ChildItem -Path $rootDir -Recurse -File -Filter "package.json" |
    Where-Object { $_.FullName -notmatch $ExcludeRegex }
}

function Sort-ObjectProperties([object]$obj) {
  if ($null -eq $obj) { return $null }
  if ($obj -isnot [psobject]) { return $obj }

  $props = @($obj.PSObject.Properties)
  if ($props.Count -eq 0) { return $obj }

  $ordered = [ordered]@{}
  foreach ($p in ($props | Sort-Object Name)) { $ordered[$p.Name] = $p.Value }
  [pscustomobject]$ordered
}

function Remove-Targets([pscustomobject]$json, [string]$section, [ref]$removedCount) {
  if (-not ($json.PSObject.Properties.Name -contains $section)) { return }

  $deps = $json.$section
  if ($null -eq $deps) { return }

  # Normalize section object: ConvertFrom-Json always gives PSCustomObject for objects, but be defensive.
  if ($deps -is [hashtable]) { $deps = [pscustomobject]$deps }
  if ($deps -isnot [psobject]) { return }

  $names = @($deps.PSObject.Properties | ForEach-Object { $_.Name })
  if ($names.Count -eq 0) { return }

  $toRemove = @($Targets | Where-Object { $names -contains $_ })
  if ($toRemove.Count -eq 0) { return }

  foreach ($t in $toRemove) {
    $deps.PSObject.Properties.Remove($t)
    $removedCount.Value++
  }

  if (@($deps.PSObject.Properties).Count -eq 0) {
    $json.PSObject.Properties.Remove($section)
    return
  }

  $json.$section = Sort-ObjectProperties $deps
}

function Process-PackageJson([System.IO.FileInfo]$file) {
  $raw = Get-Content -LiteralPath $file.FullName -Raw
  try {
    $json = $raw | ConvertFrom-Json -ErrorAction Stop
  } catch {
    Write-Verbose ("Skipping invalid JSON: {0}" -f $file.FullName)
    return $null
  }

  $removed = 0
  foreach ($s in $Sections) { Remove-Targets -json $json -section $s -removedCount ([ref]$removed) }

  if ($removed -le 0) { return $null }

  $relative = Get-RelativePath $file.FullName

  if ($Apply) {
    if ($PSCmdlet.ShouldProcess($relative, "Remove vitest deps from $($Sections -join ', ')")) {
      # PS7 enforces ConvertTo-Json max depth 100. package.json is shallow.
      $json | ConvertTo-Json -Depth 50 | Set-Content -LiteralPath $file.FullName -Encoding UTF8
    }
  }

  [pscustomobject]@{ File = $relative; Removed = $removed }
}

$allFiles = @()
foreach ($root in $ScanRoots) { $allFiles += @(Get-PackageJsonFiles -rootDir $root) }

$changes = New-Object System.Collections.Generic.List[object]
$totalRemoved = 0

foreach ($f in $allFiles) {
  $r = Process-PackageJson -file $f
  if ($null -ne $r) {
    $changes.Add($r) | Out-Null
    $totalRemoved += [int]$r.Removed
  }
}

$mode = if ($Apply) { "APPLY" } elseif ($Check) { "CHECK" } else { "DRY-RUN" }

Write-Host ""
Write-Host "Mode:          $mode"
Write-Host "Scanned files: $($allFiles.Count)"
Write-Host "Affected:      $($changes.Count)"
Write-Host "Removed:       $totalRemoved"

if ($changes.Count -gt 0) {
  Write-Host "`nAffected files:"
  foreach ($c in $changes) { Write-Host (" - {0} (-{1})" -f $c.File, $c.Removed) }
}

if ($Check -and $changes.Count -gt 0) {
  throw "Root-only Vitest policy violated (vitest deps found under Applications/ or packages/)."
}

if (-not $Apply -and -not $Check) {
  Write-Host "`nDRY-RUN (default). Re-run with -Apply to write changes."
}