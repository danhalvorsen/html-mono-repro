param(
    [string]$Root = "./Libraries"
)

Write-Host "🔍 Validating workspace structure..." -ForegroundColor Cyan

$allowedPatterns = @(
    "^core-",
    "^rendering-",
    "^types-"
)

$errors = @()
$packages = Get-ChildItem -Path $Root -Recurse -Directory -Depth 2

foreach ($pkg in $packages) {
    $pkgJson = Join-Path $pkg.FullName "package.json"
    if (-Not (Test-Path $pkgJson)) {
        continue
    }

    $json = Get-Content $pkgJson | ConvertFrom-Json

    $folderName = $pkg.Name

    # pattern validation
    if (-Not ($allowedPatterns | Where-Object { $folderName -match $_ })) {
        $errors += "❌ INVALID PACKAGE NAME: ${folderName} does not match core-*, rendering-*, types-*"
        continue
    }

    # required fields
    if (-Not $json.name)     { $errors += "❌ Missing 'name' in ${folderName}" }
    if (-Not $json.version)  { $errors += "❌ Missing 'version' in ${folderName}" }
    if (-Not $json.main)     { $errors += "❌ Missing 'main' in ${folderName}" }
    if (-Not $json.types)    { $errors += "❌ Missing 'types' in ${folderName}" }
    if (-Not $json.scripts.build) { $errors += "❌ Missing build script in ${folderName}" }

    # workspace:* dep enforcement
    if ($json.dependencies) {
        foreach ($dep in $json.dependencies.PSObject.Properties) {
            if ($dep.Value -notmatch "^workspace:") {
                $errors += "❌ Non-workspace dep '${($dep.Name)}' in ${folderName}: '${($dep.Value)}'"
            }
        }
    }

    # tsconfig consistency
    $tsConfig = Join-Path $pkg.FullName "tsconfig.json"
    if (Test-Path $tsConfig) {
        $ts = Get-Content $tsConfig | ConvertFrom-Json
        if ($ts.extends -ne "../tsconfig.base.json") {
            $errors += "❌ ${folderName} tsconfig.json must extend ../tsconfig.base.json"
        }
    }

    Write-Host "✔ VALID: ${folderName}" -ForegroundColor Green
}

if ($errors.Count -eq 0) {
    Write-Host "`n🎉 ALL PACKAGES VALID" -ForegroundColor Green
} else {
    Write-Host "`n❗ ERRORS FOUND:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host $_ -ForegroundColor Red }
}
