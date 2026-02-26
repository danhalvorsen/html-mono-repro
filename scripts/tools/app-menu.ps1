# scripts/tools/app-menu.ps1
# Professional boxed menu (Unicode) + tabs (\t) + color
# Controls:
#   - ↑/↓ selects, PgUp/PgDn scrolls, Enter selects, ESC exits
#   - T toggles sort (DATE/NAME) and re-renders
#   - After app select: 0=build, 1=dev (default=dev), T toggles selection
#
# Dev "last mile":
#   - Runs pnpm dev in-process (same console) via a spawned process attached to console
#   - Probes the Vite URL until it responds
#   - Opens browser once ready
#   - Pins port to 5173 (deterministic open)
#
# Robustness:
#   - Resolves pnpm deterministically: pnpm on PATH -> corepack pnpm -> npx pnpm
#   - Clear error if none found

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

function Write-BoxTop    { param([Parameter(Mandatory)] [int]$Width) Write-Host ("┌" + ("─" * $Width) + "┐") }
function Write-BoxSep    { param([Parameter(Mandatory)] [int]$Width) Write-Host ("├" + ("─" * $Width) + "┤") }
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
function Write-BoxLineHighlighted {
    param(
        [Parameter(Mandatory)] [string]$Content,
        [Parameter(Mandatory)] [int]$Width,
        [ConsoleColor]$Fg = [ConsoleColor]::Black,
        [ConsoleColor]$Bg = [ConsoleColor]::Cyan
    )

    $text = $Content
    if ($text.Length -gt $Width) { $text = $text.Substring(0, $Width) }
    $pad = $Width - $text.Length

    $oldFg = [Console]::ForegroundColor
    $oldBg = [Console]::BackgroundColor
    try {
        [Console]::ForegroundColor = $Fg
        [Console]::BackgroundColor = $Bg
        Write-Host ("│" + $text + (" " * $pad) + "│")
    }
    finally {
        [Console]::ForegroundColor = $oldFg
        [Console]::BackgroundColor = $oldBg
    }
}

function Render-AppsBox {
    param(
        [Parameter(Mandatory)] $Apps,
        [Parameter(Mandatory)] [ValidateSet("date","name")] [string]$Sort,
        [Parameter(Mandatory)] [int]$SelectedIndex,
        [Parameter(Mandatory)] [int]$TopIndex
    )

    $inner = [Math]::Min(120, [Math]::Max(90, [Console]::WindowWidth - 4))

    # Layout
    $wIndex = 4
    $wName  = 28
    $wDate  = 16
    $wPath  = [Math]::Max(10, $inner - ($wIndex + 1 + $wName + 1 + $wDate + 1))

    # How many rows can we show
    $rowsVisible = [Math]::Max(8, [Console]::WindowHeight - 12)
    $end = [Math]::Min($Apps.Count, $TopIndex + $rowsVisible)

    Clear-Host
    Write-BoxTop -Width $inner

    $sortBadge = if ($Sort -eq "date") { "DATE" } else { "NAME" }
    $header = " MonoRepro App Menu    " + (Get-Date).ToString("yyyy-MM-dd HH:mm")
    Write-BoxLine -Width $inner -Color Cyan -Content (Fit $header $inner)
    Write-BoxSep -Width $inner

    $status = " Sort: [$sortBadge] (T toggles)   ↑↓ move   PgUp/PgDn scroll   Enter select   ESC exit   Apps: $($Apps.Count)"
    Write-BoxLine -Width $inner -Color DarkGray -Content (Fit $status $inner)

    Write-BoxSep -Width $inner

    $hdr = ("{0,-$wIndex} {1,-$wName} {2,-$wDate} {3,-$wPath}" -f "#", "Name", "Last Modified", "Path")
    Write-BoxLine -Width $inner -Color DarkCyan -Content (Fit $hdr $inner)
    Write-BoxSep -Width $inner

    for ($i = $TopIndex; $i -lt $end; $i++) {
        $a = $Apps[$i]

        $row = ("{0,-$wIndex} {1,-$wName} {2,-$wDate} {3,-$wPath}" -f
            "$i",
            (Fit $a.Name $wName),
            ($a.LastModified.ToString("yyyy-MM-dd HH:mm")),
            (Fit $a.Path $wPath)
        )

        if ($i -eq $SelectedIndex) {
            Write-BoxLineHighlighted -Width $inner -Content (Fit $row $inner) -Fg Black -Bg Cyan
        }
        else {
            Write-BoxLine -Width $inner -Color Gray -Content (Fit $row $inner)
        }
    }

    if ($Apps.Count -gt $end) {
        Write-BoxSep -Width $inner
        Write-BoxLine -Width $inner -Color DarkGray -Content (Fit " … more below (PgDn)" $inner)
    }

    Write-BoxBottom -Width $inner
    Write-Host ""
}

function Select-IndexInteractive {
    param(
        [Parameter(Mandatory)] $Apps,
        [Parameter(Mandatory)] [ref]$SortRef
    )

    $selected = 0
    $top = 0

    while ($true) {
        Render-AppsBox -Apps $Apps -Sort $SortRef.Value -SelectedIndex $selected -TopIndex $top

        $key = [Console]::ReadKey($true)
        switch ($key.Key) {
            ([ConsoleKey]::Escape) { return $null }
            ([ConsoleKey]::Enter)  { return $selected }

            ([ConsoleKey]::UpArrow) {
                if ($selected -gt 0) { $selected-- }
            }
            ([ConsoleKey]::DownArrow) {
                if ($selected -lt ($Apps.Count - 1)) { $selected++ }
            }
            ([ConsoleKey]::PageUp) {
                $selected = [Math]::Max(0, $selected - 10)
            }
            ([ConsoleKey]::PageDown) {
                $selected = [Math]::Min($Apps.Count - 1, $selected + 10)
            }
            default {
                if ($key.KeyChar -eq 't' -or $key.KeyChar -eq 'T') {
                    $SortRef.Value = if ($SortRef.Value -eq "date") { "name" } else { "date" }
                    $Apps = Sort-Apps -Apps $Apps -Sort $SortRef.Value
                    if ($selected -gt ($Apps.Count - 1)) { $selected = $Apps.Count - 1 }
                }
            }
        }

        # keep selected in view
        $rowsVisible = [Math]::Max(8, [Console]::WindowHeight - 12)
        if ($selected -lt $top) { $top = $selected }
        if ($selected -ge ($top + $rowsVisible)) { $top = $selected - $rowsVisible + 1 }
        if ($top -lt 0) { $top = 0 }
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
# Dev "last mile" helpers
# ----------------------------
function Test-HttpOk {
    param(
        [Parameter(Mandatory)] [string]$Url,
        [int]$TimeoutSeconds = 1
    )
    try {
        # GET is more compatible than HEAD across dev servers/proxies.
        $resp = Invoke-WebRequest -Uri $Url -UseBasicParsing -Method Get -TimeoutSec $TimeoutSeconds
        return ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 500)
    } catch {
        return $false
    }
}

function Wait-ForHttpOk {
    param(
        [Parameter(Mandatory)] [string]$Url,
        [int]$MaxWaitSeconds = 12
    )
    $deadline = (Get-Date).AddSeconds($MaxWaitSeconds)
    while ((Get-Date) -lt $deadline) {
        if (Test-HttpOk -Url $Url) { return $true }
        Start-Sleep -Milliseconds 250
    }
    return $false
}

# ----------------------------
# pnpm resolution + process launch
# ----------------------------
function Resolve-CommandPathOrNull {
    param([Parameter(Mandatory)] [string]$Name)
    try {
        $cmd = Get-Command $Name -ErrorAction Stop
        return $cmd.Source
    } catch {
        return $null
    }
}

function Resolve-PnpmInvocation {
    # Returns: @{ FileName = "<exe>"; PrefixArgs = @("pnpm")? }
    # PrefixArgs are inserted BEFORE normal pnpm args (for corepack/npx shims).
    $pnpm = Resolve-CommandPathOrNull -Name "pnpm"
    if ($pnpm) { return @{ FileName = $pnpm; PrefixArgs = @() } }

    $corepack = Resolve-CommandPathOrNull -Name "corepack"
    if ($corepack) { return @{ FileName = $corepack; PrefixArgs = @("pnpm") } }

    $npx = Resolve-CommandPathOrNull -Name "npx"
    if ($npx) { return @{ FileName = $npx; PrefixArgs = @("pnpm") } }

    return $null
}

function Quote-ArgForProcess {
    param([Parameter(Mandatory)] [string]$Arg)
    if ($Arg -match '\s|"') {
        return '"' + ($Arg -replace '"','\"') + '"'
    }
    return $Arg
}

function Start-PnpmRun {
    param(
        [Parameter(Mandatory)] [string]$RepoRoot,
        [Parameter(Mandatory)] [string]$Filter,
        [Parameter(Mandatory)] [ValidateSet("build","dev")] [string]$Action,
        [string[]] $ExtraArgs = @()
    )

    $inv = Resolve-PnpmInvocation
    if ($null -eq $inv) {
        throw @"
pnpm not found.
Fix options (pick one) and restart terminal:
  1) Corepack:
       corepack enable
       corepack prepare pnpm@latest --activate
  2) Global:
       npm i -g pnpm
"@
    }

    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $inv.FileName
    $psi.WorkingDirectory = $RepoRoot
    $psi.UseShellExecute = $false
    $psi.RedirectStandardOutput = $false
    $psi.RedirectStandardError  = $false

    $args = @()
    $args += $inv.PrefixArgs
    $args += @("-F", $Filter, $Action)
    $args += $ExtraArgs

    $psi.Arguments = ($args | ForEach-Object { Quote-ArgForProcess -Arg ([string]$_) }) -join " "

    $p = [System.Diagnostics.Process]::Start($psi)
    if ($null -eq $p) { throw "Failed to start pnpm process." }
    return $p
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

$filter = "$($app.Name)..."

With-Fg Cyan   { Write-Host "Executing:" }
With-Fg Yellow { Write-Host ("pnpm -F `"$filter`" $action") }
Write-Host ""

Push-Location $RepoRoot
try {
    if ($action -eq "dev") {
        $port = 5173
        $url  = "http://localhost:$port/"

        # Run dev server (attached). Pass-through args to underlying dev runner via `-- ...`
        $p = Start-PnpmRun -RepoRoot $RepoRoot -Filter $filter -Action "dev" -ExtraArgs @("--", "--port", "$port")

        # Probe and open browser once responding (do not fail if it never responds)
        if (Wait-ForHttpOk -Url $url -MaxWaitSeconds 12) {
            Start-Process $url
        }

        $p.WaitForExit()
        if ($p.ExitCode -ne 0) { exit $p.ExitCode }
        exit 0
    }

    # Build uses the current PowerShell invocation.
    & pnpm -F $filter $action
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
finally {
    Pop-Location
}