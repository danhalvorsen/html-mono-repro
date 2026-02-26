# scripts/pnpm-scan-invalid-depkeys.ps1
$ErrorActionPreference = "Stop"

$validName = '^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$'

$depSections = @(
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies"
)

$items =
  Get-ChildItem -Recurse -Filter package.json |
  Where-Object FullName -notmatch 'node_modules'

$bad = @()

foreach ($f in $items) {
  $path = $f.FullName
  try { $j = Get-Content $path -Raw | ConvertFrom-Json } catch { continue }

  foreach ($sec in $depSections) {
    $obj = $j.$sec
    if (-not $obj) { continue }

    foreach ($p in $obj.PSObject.Properties) {
      $depName = [string]$p.Name
      $depVer  = [string]$p.Value

      if ($depName -notmatch $validName) {
        $bad += [pscustomobject]@{
          BadKey       = $depName
          Version      = $depVer
          Section      = $sec
          PackageJson  = $path
        }
      }
    }
  }

  # also scan pnpm.overrides keys if present
  if ($j.pnpm -and $j.pnpm.overrides) {
    foreach ($p in $j.pnpm.overrides.PSObject.Properties) {
      $k = [string]$p.Name
      # override keys can be "pkg" or "pkg@ver" or "@scope/pkg"
      $pkgOnly = ($k -split "@")[0]
      if ($pkgOnly -and $pkgOnly -notmatch $validName) {
        $bad += [pscustomobject]@{
          BadKey      = $k
          Version     = [string]$p.Value
          Section     = "pnpm.overrides"
          PackageJson = $path
        }
      }
    }
  }
}

if ($bad.Count -eq 0) {
  Write-Host "OK: No invalid dependency keys found."
} else {
  Write-Host ""
  Write-Host "INVALID DEPENDENCY KEYS FOUND:"
  $bad | Sort-Object BadKey, PackageJson | Format-Table -AutoSize
  exit 2
}