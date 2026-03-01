<#
  pnpm-diagnose.ps1
  Read-only diagnostics:
   - Finds workspace roots (pnpm-workspace.yaml)
   - Lists all package.json names
   - Finds workspace:* deps referencing missing package names
   - Detects common “scope mismatch” candidates
#>

[CmdletBinding()]
param(
  [Parameter(Mandatory = $false)]
  [string] $RepoRoot = (Get-Location).Path
)

function Read-JsonFile {
  param([string]$Path)
  try { return Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json }
  catch { return $null }
}

Write-Host "RepoRoot: $RepoRoot"
Write-Host ""

# 1) Find pnpm workspace roots (nested workspaces are a frequent source of confusion)
$workspaceFiles = Get-ChildItem -LiteralPath $RepoRoot -Recurse -File -Filter "pnpm-workspace.yaml" -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -notmatch "\\node_modules\\" } |
  Sort-Object FullName

Write-Host "pnpm-workspace.yaml files found: $($workspaceFiles.Count)"
$workspaceFiles | ForEach-Object { Write-Host " - $($_.FullName)" }
Write-Host ""

# 2) Collect all package.json (excluding node_modules) and resolve package names
$packageFiles = Get-ChildItem -LiteralPath $RepoRoot -Recurse -File -Filter "package.json" -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -notmatch "\\node_modules\\" } |
  Sort-Object FullName

$packages = @()
foreach ($f in $packageFiles) {
  $j = Read-JsonFile $f.FullName
  if ($null -eq $j) { continue }
  if ([string]::IsNullOrWhiteSpace($j.name)) { continue }

  $packages += [pscustomobject]@{
    Name = [string]$j.name
    Path = $f.FullName
  }
}

$packageNames = $packages | Select-Object -ExpandProperty Name

Write-Host "package.json with a name field: $($packages.Count)"
Write-Host ""

# 3) Find workspace:* dependencies that reference missing packages
$missingWorkspaceDeps = @()

foreach ($f in $packageFiles) {
  $j = Read-JsonFile $f.FullName
  if ($null -eq $j) { continue }

  $deps = @()
  if ($j.dependencies) { $deps += $j.dependencies.PSObject.Properties }
  if ($j.devDependencies) { $deps += $j.devDependencies.PSObject.Properties }
  if ($j.peerDependencies) { $deps += $j.peerDependencies.PSObject.Properties }
  if ($j.optionalDependencies) { $deps += $j.optionalDependencies.PSObject.Properties }

  foreach ($p in $deps) {
    $depName = $p.Name
    $depVer  = [string]$p.Value

    if ($depVer -ne "workspace:*") { continue }

    if ($packageNames -notcontains $depName) {
      # Try to suggest a scoped candidate if one exists
      $candidates = $packageNames | Where-Object { $_.Split("/")[-1] -eq $depName } | Sort-Object
      $suggest = if ($candidates.Count -gt 0) { ($candidates -join ", ") } else { "" }

      $missingWorkspaceDeps += [pscustomobject]@{
        Missing      = $depName
        ReferencedBy = $f.FullName
        Suggestion   = $suggest
      }
    }
  }
}

if ($missingWorkspaceDeps.Count -eq 0) {
  Write-Host "OK: No missing workspace:* dependencies found."
} else {
  Write-Host "ERROR: Missing workspace:* dependencies found: $($missingWorkspaceDeps.Count)"
  $missingWorkspaceDeps |
    Sort-Object Missing, ReferencedBy |
    Format-Table -AutoSize
}

Write-Host ""
Write-Host "Tip: Any Suggestion values are scoped packages that likely should replace the Missing name."