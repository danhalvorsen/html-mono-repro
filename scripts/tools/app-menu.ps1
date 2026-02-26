# scripts/tools/app-menu.ps1
# Professional boxed menu (Unicode) + tabs (\t) + color
# Controls:
#   - Type digits for index, ENTER selects, BACKSPACE edits, ESC exits
#   - T toggles sort (DATE/NAME) and re-renders
#   - After app select: 0=build, 1=dev (default=dev), T toggles selection

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ----------------------------
# Repo root resolution
# ----------------------------
function Resolve-MonorepoRoot {
    param([Parameter(Mandatory)] [string]$StartDir)

    $dir = (Resolve-Path $StartDir).Path
    while ($true) {
        if (Test-Path (Join-Path $dir "pnpm-workspace.yaml") -PathType Leaf) { return $dir }
        if (Test-Path (Join-Path $dir "package.json") -PathType Leaf) { return $dir }

        $parent = Split-Path $dir -Parent
        if ([string]::IsNullOrWhiteSpace($parent) -or ($parent -eq $dir)) {
            throw "Monorepo root not found walking up from: $StartDir (expected pnpm-workspace.yaml or package.json)"
        }
        $dir = $parent
    }
}

# ----------------------------
# JSON helpers
# ----------------------------
function Try-ReadJsonObject {
    param([Parameter(Mandatory)] [string]$Path)
    $raw = Get-Content $Path -Raw -Encoding UTF8
    $obj = $raw | ConvertFrom-Json -ErrorAction Stop
    if ($null -eq $obj -or $obj.PSObject -eq $null) { return $null }
    return $obj
}

function Get-PropValue {
    param(
        [Parameter(Mandatory)] $Obj,
        [Parameter(Mandatory)] [string]$Name
    )
    $p = $Obj.PSObject.Properties[$Name]
    if ($null -eq $p) { return $null }
    return $p.Value
}

# ----------------------------
# UI primitives
# ----------------------------
function With-Fg {
    param(
        [Parameter(Mandatory)] [ConsoleColor]$Color,
        [Parameter(Mandatory)] [scriptblock]$Body
    )
    $old = [Console]::ForegroundColor
    try { [Console]::ForegroundColor = $Color; & $Body }
    finally { [Console]::ForegroundColor = $old }
}

function Write-BoxLine {
    param(
        [Parameter(Mandatory)] [string]$Content,
        [Parameter(Mandatory)] [int]$Width,
        [ConsoleColor]$Color = [ConsoleColor]::Gray
    )
    $text = $Content
    if ($text.Length -gt $Width) { $text = $text.Substring(0, $Width) }
    $pad = $Width - $text.Length
    With-Fg $Color { Write-Host ("│" + $text + (" " * $pad) + "│") }
}

function Write-BoxTop { param([Parameter(Mandatory)] [int]$Width) Write-Host ("┌" + ("─" * $Width) + "┐") }
function Write-BoxSep { param([Parameter(Mandatory)] [int]$Width) Write-Host ("├" + ("─" * $Width) + "┤") }
function Write-BoxBottom { param([Parameter(Mandatory)] [int]$Width) Write-Host ("└" + ("─" * $Width) + "┘") }

function Fit {
    param([string]$S, [int]$Max)
    if ($null -eq $S) { return "" }
    if ($S.Length -le $Max) { return $S }
    if ($Max -lt 1) { return "" }
    if ($Max -le 1) { return "…" }
    return $S.Substring(0, $Max - 1) + "…"
}

function Sort-Apps {
    param(
        [Parameter(Mandatory)] $Apps,
        [Parameter(Mandatory)] [ValidateSet("date","name")] [string]$Sort
    )
    if ($Sort -eq "date") { return ($Apps | Sort-Object LastModified -Descending) }
    return ($Apps | Sort-Object Name)
}

# ----------------------------
# Render app list (boxed)
# ----------------------------
function Render-AppsBox {
    param(
        [Parameter(Mandatory)] $Apps,
        [Parameter(Mandatory)] [ValidateSet("date","name")] [string]$Sort,
        [Parameter(Mandatory)] [AllowEmptyString()] [string]$Typed
    )

    $inner = [Math]::Min(120, [Math]::Max(80, [Console]::WindowWidth - 4))

    Clear-Host
    Write-BoxTop -Width $inner

    $sortBadge = if ($Sort -eq "date") { "DATE" } else { "NAME" }
    $header = " MonoRepro App Menu`t`t`t" + (Get-Date).ToString("yyyy-MM-dd HH:mm")
    Write-BoxLine -Width $inner -Color Cyan -Content (Fit $header $inner)
    Write-BoxSep -Width $inner

    $statusIndex = if ([string]::IsNullOrWhiteSpace($Typed)) { "<type digits>" } else { $Typed }
    $status = " Sort:`t[$sortBadge]`t(press T)`tIndex:`t$statusIndex`tApps:`t$($Apps.Count)"
    Write-BoxLine -Width $inner -Color Gray -Content (Fit $status $inner)

    $hint = " T=Toggle Sort`tESC=Exit`tBackspace=Edit`tEnter=Select"
    Write-BoxLine -Width $inner -Color DarkGray -Content (Fit $hint $inner)

    Write-BoxSep -Width $inner
   $wIndex = 4
$wName  = 28
$wDate  = 16   # "yyyy-MM-dd HH:mm" = 16 chars
$wPath  = [Math]::Max(10, $inner - ($wIndex + 1 + $wName + 1 + $wDate + 1)) # remaining

$header = ("{0,-$wIndex} {1,-$wName} {2,-$wDate} {3,-$wPath}" -f "#", "Name", "Last Modified", "Path")
Write-BoxLine -Width $inner -Color DarkCyan -Content (Fit $header $inner)
Write-BoxSep -Width $inner

$maxRows = [Math]::Min($Apps.Count, [Math]::Max(8, [Console]::WindowHeight - 12))
for ($i = 0; $i -lt $maxRows; $i++) {
    $a = $Apps[$i]

    $idxText  = "$i"
    $nameText = Fit $a.Name $wName
    $dateText = $a.LastModified.ToString("yyyy-MM-dd HH:mm")
    $pathText = Fit $a.Path $wPath

    $row = ("{0,-$wIndex} {1,-$wName} {2,-$wDate} {3,-$wPath}" -f $idxText, $nameText, $dateText, $pathText)
    Write-BoxLine -Width $inner -Color Gray -Content (Fit $row $inner)
}

    if ($Apps.Count -gt $maxRows) {
        Write-BoxSep -Width $inner
        Write-BoxLine -Width $inner -Color DarkGray -Content (Fit (" … showing $maxRows of $($Apps.Count). Resize console to show more.") $inner)
    }

    Write-BoxBottom -Width $inner
    Write-Host ""

    # Sort badge color (overlay info line below box)
    Write-Host -NoNewline "Sort badge: "
    if ($Sort -eq "date") { With-Fg Green { Write-Host "[DATE]" } } else { With-Fg Yellow { Write-Host "[NAME]" } }
}

function Select-IndexInteractive {
    param(
        [Parameter(Mandatory)] $Apps,
        [Parameter(Mandatory)] [ref]$SortRef
    )

    $typed = ""

    while ($true) {
        Render-AppsBox -Apps $Apps -Sort $SortRef.Value -Typed $typed
        $key = [Console]::ReadKey($true)

        switch ($key.Key) {
            ([ConsoleKey]::Escape) { return $null }

            ([ConsoleKey]::Backspace) {
                if ($typed.Length -gt 0) { $typed = $typed.Substring(0, $typed.Length - 1) }
            }

            ([ConsoleKey]::Enter) {
                if ([string]::IsNullOrWhiteSpace($typed)) { continue }

                [int]$idx = 0
                if (-not [int]::TryParse($typed, [ref]$idx)) { $typed = ""; continue }
                if ($idx -lt 0 -or $idx -ge $Apps.Count) { $typed = ""; continue }
                return $idx
            }

            default {
                if ($key.KeyChar -eq 't' -or $key.KeyChar -eq 'T') {
                    $SortRef.Value = if ($SortRef.Value -eq "date") { "name" } else { "date" }
                    $Apps = Sort-Apps -Apps $Apps -Sort $SortRef.Value
                    continue
                }

                if ($key.KeyChar -ge '0' -and $key.KeyChar -le '9') {
                    if ($typed.Length -lt 6) { $typed += [string]$key.KeyChar }
                }
            }
        }
    }
}

# ----------------------------
# Action menu (boxed) with toggle
# ----------------------------
function Render-ActionBox {
    param(
        [Parameter(Mandatory)] [string]$AppName,
        [Parameter(Mandatory)] [string]$AppPath,
        [Parameter(Mandatory)] [ValidateSet("build","dev")] [string]$Selected
    )

    $inner = [Math]::Min(100, [Math]::Max(70, [Console]::WindowWidth - 4))

    Clear-Host
    Write-BoxTop -Width $inner
    Write-BoxLine -Width $inner -Color Cyan -Content (Fit (" Selected App`t" + $AppName) $inner)
    Write-BoxLine -Width $inner -Color DarkGray -Content (Fit (" Path`t" + $AppPath) $inner)
    Write-BoxSep -Width $inner

    Write-BoxLine -Width $inner -Color DarkCyan -Content " Action`tKey`tDefault`tToggle"
    Write-BoxSep -Width $inner

    $buildLine = " build`t0`tNo`tT toggles"
    $devLine   = " dev (run)`t1`tYes`tT toggles"

    if ($Selected -eq "build") {
        With-Fg DarkYellow { Write-Host ("│" + (Fit (" " + $buildLine) $inner).PadRight($inner) + "│") }
        With-Fg Gray      { Write-Host ("│" + (Fit (" " + $devLine)   $inner).PadRight($inner) + "│") }
    } else {
        With-Fg Gray  { Write-Host ("│" + (Fit (" " + $buildLine) $inner).PadRight($inner) + "│") }
        With-Fg Green { Write-Host ("│" + (Fit (" " + $devLine)   $inner).PadRight($inner) + "│") }
    }

    Write-BoxSep -Width $inner
    Write-BoxLine -Width $inner -Color DarkGray -Content " ENTER=Confirm`tT=Toggle`tESC=Cancel"
    Write-BoxBottom -Width $inner
    Write-Host ""
}

function Select-ActionInteractive {
    param(
        [Parameter(Mandatory)] [string]$AppName,
        [Parameter(Mandatory)] [string]$AppPath
    )

    $selected = "dev" # default

    while ($true) {
        Render-ActionBox -AppName $AppName -AppPath $AppPath -Selected $selected
        $key = [Console]::ReadKey($true)

        switch ($key.Key) {
            ([ConsoleKey]::Escape) { return $null }
            ([ConsoleKey]::Enter)  { return $selected }
            default {
                if ($key.KeyChar -eq '0') { return "build" }
                if ($key.KeyChar -eq '1') { return "dev" }
                if ($key.KeyChar -eq 't' -or $key.KeyChar -eq 'T') {
                    $selected = if ($selected -eq "dev") { "build" } else { "dev" }
                }
            }
        }
    }
}

# ----------------------------
# Main: discovery
# ----------------------------
$RepoRoot = Resolve-MonorepoRoot -StartDir $PSScriptRoot
$ApplicationsRoot = Join-Path $RepoRoot "Applications"

if (!(Test-Path $ApplicationsRoot -PathType Container)) {
    throw "Applications folder not found: $ApplicationsRoot"
}

$apps =
    Get-ChildItem -Path $ApplicationsRoot -Recurse -File -Filter "package.json" |
    Where-Object {
        $p = $_.FullName
        $p -notmatch "\\node_modules\\" -and
        $p -notmatch "\\dist\\" -and
        $p -notmatch "\\build\\" -and
        $p -notmatch "\\.vite\\" -and
        $p -notmatch "\\.pnpm\\" -and
        $p -notmatch "\\.turbo\\" -and
        $p -notmatch "\\.next\\" -and
        $p -notmatch "\\out\\"
    } |
    ForEach-Object {
        $json = $null
        try { $json = Try-ReadJsonObject -Path $_.FullName } catch { return }
        if ($null -eq $json) { return }

        $name = Get-PropValue -Obj $json -Name "name"
        if ([string]::IsNullOrWhiteSpace([string]$name)) { return }

        $scripts = Get-PropValue -Obj $json -Name "scripts"
        if ($null -eq $scripts) { return }

        $hasBuild = $null -ne $scripts.PSObject.Properties["build"]
        $hasDev   = $null -ne $scripts.PSObject.Properties["dev"]
        $hasStart = $null -ne $scripts.PSObject.Properties["start"]
        if (-not ($hasBuild -or $hasDev -or $hasStart)) { return }

        $relPath = $_.Directory.FullName.Substring($RepoRoot.Length).TrimStart('\','/')
        if ($relPath -eq "Applications") { return }

        [PSCustomObject]@{
            Name         = [string]$name
            Path         = $relPath
            PackageJson  = $_.FullName
            LastModified = $_.LastWriteTime
        }
    } |
    Where-Object { $_ -ne $null } |
    Sort-Object Name -Unique

if ($apps.Count -eq 0) {
    Write-Host "No applications found under: $ApplicationsRoot"
    exit 1
}

# ----------------------------
# Flow
# ----------------------------
$sort = "date"
$apps = Sort-Apps -Apps $apps -Sort $sort

$idx = Select-IndexInteractive -Apps $apps -SortRef ([ref]$sort)
if ($null -eq $idx) { exit 0 }

$app = $apps[$idx]

$action = Select-ActionInteractive -AppName $app.Name -AppPath $app.Path
if ($null -eq $action) { exit 0 }

Clear-Host
With-Fg Cyan { Write-Host "Executing:" }
With-Fg Yellow { Write-Host ("pnpm -F `"$($app.Name)...`" $action") }

Push-Location $RepoRoot
try {
    & pnpm -F "$($app.Name)..." $action
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
finally {
    Pop-Location
}