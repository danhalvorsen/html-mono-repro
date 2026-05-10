[CmdletBinding(PositionalBinding = $false)]
param(
    [Parameter(Mandatory = $false)]
    [string]$OutputRoot = "",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$OutputFileName = "combined.ai-code.txt",

    [Parameter(Mandatory = $false)]
    [switch]$IncludeTests,

    [Parameter(Mandatory = $false)]
    [switch]$IncludeConfigs
,
    [Parameter(Mandatory = $false, Position = 0, ValueFromRemainingArguments = $true)]
    [string[]]$Paths
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptBasePath = if (-not [string]::IsNullOrWhiteSpace($PSScriptRoot)) {
    $PSScriptRoot
}
elseif (-not [string]::IsNullOrWhiteSpace($PSCommandPath)) {
    Split-Path -Parent $PSCommandPath
}
else {
    (Get-Location).Path
}

if ([string]::IsNullOrWhiteSpace($OutputRoot)) {
    $OutputRoot = Join-Path $scriptBasePath ".ai-share"
}

$sharedScriptPath = Join-Path $scriptBasePath "../../scripts/code-sharing/export-npm-modules-for-ai.ps1"
$sharedScriptPath = (Resolve-Path -LiteralPath $sharedScriptPath).Path

if (-not (Test-Path -LiteralPath $sharedScriptPath -PathType Leaf)) {
    throw "Shared script not found: $sharedScriptPath"
}

function Get-PackageLabel {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RootPath
    )

    $packageJsonPath = Join-Path $RootPath "package.json"

    if (Test-Path -LiteralPath $packageJsonPath -PathType Leaf) {
        try {
            $json = Get-Content -LiteralPath $packageJsonPath -Raw | ConvertFrom-Json
            if ($null -ne $json.name -and -not [string]::IsNullOrWhiteSpace([string]$json.name)) {
                return [string]$json.name
            }
        }
        catch {
        }
    }

    return [System.IO.Path]::GetFileName($RootPath)
}

# Default list when no paths are passed to the script.
$defaultFoldersToExport = @(
    "C:\Users\danha\source\repos\HTML\MonoRepro\packages\core-design-composite"
    # "C:\Users\danha\source\repos\HTML\MonoRepro\packages\another-package"
)

$foldersToExport = @(
    if ($null -ne $Paths -and $Paths.Count -gt 0) {
        foreach ($path in $Paths) {
            if (-not [string]::IsNullOrWhiteSpace($path)) {
                $path
            }
        }
    }
    else {
        $defaultFoldersToExport
    }
)

if (-not (Test-Path -LiteralPath $OutputRoot -PathType Container)) {
    New-Item -ItemType Directory -Path $OutputRoot | Out-Null
}

$tempOutputRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("fetchCode_" + [System.Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $tempOutputRoot | Out-Null

$combinedBuilder = [System.Text.StringBuilder]::new()

[void]$combinedBuilder.AppendLine("// COMBINED AI CODE EXPORT")
[void]$combinedBuilder.AppendLine("// GENERATED: $((Get-Date).ToString('yyyy-MM-ddTHH:mm:ssK'))")
[void]$combinedBuilder.AppendLine("// INCLUDE_TESTS: $($IncludeTests.IsPresent)")
[void]$combinedBuilder.AppendLine("// INCLUDE_CONFIGS: $($IncludeConfigs.IsPresent)")

$includedRoots = New-Object System.Collections.Generic.List[string]
$exportedCount = 0

foreach ($folderPath in $foldersToExport) {
    if ([string]::IsNullOrWhiteSpace($folderPath)) {
        continue
    }

    if (-not (Test-Path -LiteralPath $folderPath -PathType Container)) {
        Write-Warning "Skipping missing folder: $folderPath"
        continue
    }
    $resolvedRoot = (Resolve-Path -LiteralPath $folderPath).Path

    $packageLabel = Get-PackageLabel -RootPath $resolvedRoot
    $safeLabel = ($packageLabel -replace '[^a-zA-Z0-9._-]', '_')
    $partialOutputName = "$safeLabel.ai-code.txt"

    & $sharedScriptPath `
        -Root $resolvedRoot `
        -OutputRoot $tempOutputRoot `
        -OutputFileName $partialOutputName `
        -IncludeTests:$IncludeTests.IsPresent `
        -IncludeConfigs:$IncludeConfigs.IsPresent

    $partialOutputPath = Join-Path $tempOutputRoot $partialOutputName

    if (-not (Test-Path -LiteralPath $partialOutputPath -PathType Leaf)) {
        throw "Expected partial output was not created: $partialOutputPath"
    }

    $content = Get-Content -LiteralPath $partialOutputPath -Raw

    [void]$combinedBuilder.AppendLine()
    [void]$combinedBuilder.AppendLine("################################################################################")
    [void]$combinedBuilder.AppendLine("// EXPORT: $packageLabel")
    [void]$combinedBuilder.AppendLine("// ROOT: $resolvedRoot")
    [void]$combinedBuilder.AppendLine("################################################################################")
    [void]$combinedBuilder.AppendLine()
    [void]$combinedBuilder.AppendLine($content.TrimEnd())
    [void]$combinedBuilder.AppendLine()

    $includedRoots.Add($resolvedRoot) | Out-Null
    $exportedCount++
}

if ($exportedCount -eq 0) {
    throw "No valid folders were exported. Check input paths."
}

$combinedOutputPath = Join-Path $OutputRoot $OutputFileName
[System.IO.File]::WriteAllText(
    $combinedOutputPath,
    $combinedBuilder.ToString(),
    [System.Text.UTF8Encoding]::new($false)
)

Write-Host "Combined exports: $($includedRoots.Count)"
foreach ($root in $includedRoots) {
    Write-Host " - $root"
}
Write-Host "Output: $combinedOutputPath"

if (Test-Path -LiteralPath $tempOutputRoot -PathType Container) {
    Remove-Item -LiteralPath $tempOutputRoot -Recurse -Force
}
