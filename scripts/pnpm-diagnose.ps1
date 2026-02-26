# pnpm-diagnose.ps1
# READ ONLY — DOES NOT MODIFY ANYTHING

Write-Host "==== PNPM WORKSPACE DIAGNOSTIC ====" -ForegroundColor Cyan
Write-Host ""

$repo = Get-Location

Write-Host "Repo:" $repo
Write-Host ""

# ------------------------------------------------
Write-Host "Workspace files:" -ForegroundColor Yellow
Get-ChildItem -Recurse -Filter pnpm-workspace.yaml -ErrorAction SilentlyContinue |
Where-Object FullName -notmatch "node_modules" |
ForEach-Object { Write-Host " - $($_.FullName)" }

Write-Host ""

# ------------------------------------------------
Write-Host "Collecting package names..." -ForegroundColor Yellow

$packages = @{}

Get-ChildItem -Recurse -Filter package.json |
Where-Object FullName -notmatch "node_modules" |
ForEach-Object {
    try {
        $json = Get-Content $_.FullName -Raw | ConvertFrom-Json
        if ($json.name) {
            $packages[$json.name] = $_.FullName
        }
    } catch {}
}

Write-Host "Packages detected:" $packages.Count
$packages.Keys | Sort-Object | ForEach-Object { Write-Host "  $_" }

Write-Host ""

# ------------------------------------------------
Write-Host "Checking workspace:* dependencies..." -ForegroundColor Yellow

$errors = @()

Get-ChildItem -Recurse -Filter package.json |
Where-Object FullName -notmatch "node_modules" |
ForEach-Object {

    $path = $_.FullName
    try { $json = Get-Content $path -Raw | ConvertFrom-Json } catch { return }

    if (-not $json.dependencies) { return }

    foreach ($dep in $json.dependencies.PSObject.Properties) {

        if ($dep.Value -eq "workspace:*") {

            if (-not $packages.ContainsKey($dep.Name)) {

                $errors += [pscustomobject]@{
                    Missing      = $dep.Name
                    ReferencedBy = $path
                }
            }
        }
    }
}

if ($errors.Count -eq 0) {
    Write-Host "OK — no missing workspace deps." -ForegroundColor Green
}
else {
    Write-Host ""
    Write-Host "Missing workspace packages:" -ForegroundColor Red
    $errors | Sort-Object Missing | Format-Table -AutoSize
}

Write-Host ""
Write-Host "==== DONE (NO CHANGES MADE) ====" -ForegroundColor Cyan