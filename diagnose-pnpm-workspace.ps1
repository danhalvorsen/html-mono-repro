# ============================================================
# PNPM WORKSPACE DIAGNOSTIC (READ-ONLY)
# DOES NOT CHANGE FILES
# ============================================================

$ErrorActionPreference = "Continue"

function Section($name) {
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host $name -ForegroundColor Cyan
    Write-Host "=================================================="
}

function Info($msg) {
    Write-Host $msg -ForegroundColor Gray
}

function Ok($msg) {
    Write-Host "✔ $msg" -ForegroundColor Green
}

function Warn($msg) {
    Write-Host "⚠ $msg" -ForegroundColor Yellow
}

function Fail($msg) {
    Write-Host "✖ $msg" -ForegroundColor Red
}

# ------------------------------------------------------------
Section "Environment"

Info "Current directory: $(Get-Location)"

try {
    $pnpmVersion = pnpm -v
    Ok "pnpm version: $pnpmVersion"
}
catch {
    Fail "pnpm not available in PATH"
    exit
}

try {
    $nodeVersion = node -v
    Ok "node version: $nodeVersion"
}
catch {
    Fail "node not available"
}

# ------------------------------------------------------------
Section "Workspace root detection"

$workspaceFile = Get-ChildItem -Recurse -Filter pnpm-workspace.yaml -ErrorAction SilentlyContinue

if ($workspaceFile.Count -eq 0) {
    Fail "No pnpm-workspace.yaml found"
} else {
    foreach ($f in $workspaceFile) {
        Info "Workspace file: $($f.FullName)"
    }
}

# ------------------------------------------------------------
Section "Workspace packages (pnpm list)"

try {
    pnpm list -r --depth -1
}
catch {
    Warn "pnpm list failed (install probably broken)"
}

# ------------------------------------------------------------
Section "Collect package.json files"

$packageFiles = Get-ChildItem -Recurse -Filter package.json `
    -Exclude node_modules `
    | Where-Object { $_.FullName -notmatch "node_modules" }

Info "Found $($packageFiles.Count) package.json files"

$packages = @{}

foreach ($file in $packageFiles) {
    try {
        $json = Get-Content $file.FullName -Raw | ConvertFrom-Json
        if ($json.name) {
            $packages[$json.name] = $file.FullName
        }
    } catch {}
}

Ok "Workspace package names detected:"
$packages.Keys | Sort-Object | ForEach-Object {
    Write-Host " - $_"
}

# ------------------------------------------------------------
Section "Check workspace:* dependencies"

foreach ($file in $packageFiles) {

    $json = $null
    try {
        $json = Get-Content $file.FullName -Raw | ConvertFrom-Json
    } catch { continue }

    if (-not $json.dependencies) { continue }

    foreach ($dep in $json.dependencies.PSObject.Properties) {

        if ($dep.Value -like "workspace:*") {

            if (-not $packages.ContainsKey($dep.Name)) {
                Fail "Missing workspace package: '$($dep.Name)'"
                Info "  referenced by: $($file.FullName)"
            }
            else {
                Ok "Resolved workspace dep: $($dep.Name)"
            }
        }
    }
}

# ------------------------------------------------------------
Section "Nested workspace detection"

$nested = Get-ChildItem -Recurse -Filter pnpm-workspace.yaml `
    | Where-Object { $_.DirectoryName -ne (Get-Location).Path }

if ($nested.Count -gt 0) {
    Warn "Nested workspaces detected:"
    $nested | ForEach-Object {
        Write-Host " - $($_.FullName)"
    }
} else {
    Ok "No nested workspaces"
}

# ------------------------------------------------------------
Section "svg-rect diagnostics"

$appPath = "Applications\Lit\svg-rect"

if (Test-Path $appPath) {

    Ok "svg-rect folder found"

    if (Test-Path "$appPath\node_modules") {
        Ok "node_modules exists"
    } else {
        Warn "node_modules missing"
    }

    if (Test-Path "$appPath\node_modules\.bin\vite.cmd") {
        Ok "vite binary exists"
    } else {
        Warn "vite binary NOT found"
    }

    if (Test-Path "$appPath\src\main.ts") {
        Ok "main.ts exists"
    } else {
        Fail "main.ts missing"
    }

} else {
    Fail "svg-rect folder not found"
}

# ------------------------------------------------------------
Section "Done"

Ok "Diagnostic completed (no changes were made)."