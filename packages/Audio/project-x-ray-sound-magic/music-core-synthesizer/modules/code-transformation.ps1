# fix-code-fix-two-voices-resolver.ps1
#
# Run from the modules folder, beside code.fix.ps1:
#   .\fix-code-fix-two-voices-resolver.ps1 -Apply

[CmdletBinding()]
param(
    [switch]$Apply
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptPath = Join-Path (Get-Location).Path "code.fix.ps1"

if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing script: $scriptPath"
}

$content = Get-Content -LiteralPath $scriptPath -Raw

$start = $content.IndexOf("function Resolve-TwoVoicesSpecPath")
if ($start -lt 0) {
    throw "Could not find Resolve-TwoVoicesSpecPath in code.fix.ps1"
}

$endMarker = "`$audibleVoicePlayer = @'"
$end = $content.IndexOf($endMarker, $start)

if ($end -lt 0) {
    throw "Could not find marker after Resolve-TwoVoicesSpecPath"
}

$replacement = @'
function Resolve-TwoVoicesSpecPath {
    $integrationPath = Join-Path $modulePath "tests\integration"

    $matches = @(
        Get-ChildItem `
            -LiteralPath $integrationPath `
            -File `
            -Filter "*.ts" |
        Where-Object {
            $_.Name -like "*two*voices*oscillators*"
        }
    )

    if ($matches.Length -gt 0) {
        return $matches[0].FullName
    }

    return Join-Path $integrationPath "two-voices-two-oscillators.browser.integration.spec.ts"
}

'@

$patched =
    $content.Substring(0, $start) +
    $replacement +
    $content.Substring($end)

Write-Host "PATCH: $scriptPath"

if (-not $Apply) {
    Write-Host "Dry-run only. Re-run with -Apply."
    exit 0
}

$backupPath = "$scriptPath.bak"
Copy-Item -LiteralPath $scriptPath -Destination $backupPath -Force

$encoding = [System.Text.UTF8Encoding]::new($false)
[System.IO.File]::WriteAllText($scriptPath, $patched, $encoding)

Write-Host "BACKUP: $backupPath"
Write-Host "DONE"