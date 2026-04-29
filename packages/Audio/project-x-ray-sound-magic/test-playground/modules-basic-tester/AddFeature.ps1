# FILE: add-feature.ps1
# Creates a module-basic application feature.
# This is NOT a Lit Web Component generator.
# It follows the current IViewFeature + .view.html?raw pattern.

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$Name,

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$ModuleBasicRoot = (Get-Location).Path,

    [Parameter(Mandatory = $false)]
    [string]$Title = "",

    [Parameter(Mandatory = $false)]
    [string]$Description = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$BackupStamp = Get-Date -Format "yyyyMMdd-HHmmss"

$SrcRoot = Join-Path $ModuleBasicRoot "src"
$FeaturesRoot = Join-Path $SrcRoot "features"
$InfrastructureRoot = Join-Path $SrcRoot "infrastructure"
$ViewFeatureCatalogPath = Join-Path $InfrastructureRoot "ViewFeatureCatalog.ts"

function Assert-Directory {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (-not (Test-Path -LiteralPath $Path -PathType Container)) {
        throw "Directory not found: $Path"
    }
}

function Assert-File {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        throw "File not found: $Path"
    }
}

function Backup-File {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (Test-Path -LiteralPath $Path -PathType Leaf) {
        Copy-Item -LiteralPath $Path -Destination "$Path.bak.$BackupStamp" -Force
    }
}

function Write-Utf8File {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Content
    )

    $directory = Split-Path -Parent $Path

    if (-not (Test-Path -LiteralPath $directory -PathType Container)) {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
    }

    $normalized = $Content.TrimEnd() + [Environment]::NewLine

    if (Test-Path -LiteralPath $Path -PathType Leaf) {
        $current = Get-Content -LiteralPath $Path -Raw

        if ($current -eq $normalized) {
            Write-Host "Unchanged: $Path"
            return
        }

        Backup-File -Path $Path
    }

    [System.IO.File]::WriteAllText($Path, $normalized, $Utf8NoBom)
    Write-Host "Written:   $Path"
}

function Split-NameTokens {
    param([Parameter(Mandatory = $true)][string]$Value)

    $normalized = [System.Text.RegularExpressions.Regex]::Replace(
        $Value.Trim(),
        '[^A-Za-z0-9]+',
        ' '
    )

    $matches = [System.Text.RegularExpressions.Regex]::Matches(
        $normalized,
        '[A-Z]+(?=[A-Z][a-z]|\b)|[A-Z]?[a-z]+|\d+'
    )

    $tokens = @($matches | ForEach-Object { $_.Value })

    if ($tokens.Count -eq 0) {
        throw "Name must contain at least one alphanumeric token."
    }

    return $tokens
}

function ConvertTo-PascalCase {
    param([Parameter(Mandatory = $true)][string]$Value)

    $tokens = Split-NameTokens -Value $Value

    return ($tokens | ForEach-Object {
        $lower = $_.ToLowerInvariant()
        $lower.Substring(0, 1).ToUpperInvariant() + $lower.Substring(1)
    }) -join ""
}

function ConvertTo-LowerCamelCase {
    param([Parameter(Mandatory = $true)][string]$PascalCaseValue)

    return $PascalCaseValue.Substring(0, 1).ToLowerInvariant() + $PascalCaseValue.Substring(1)
}

function ConvertTo-KebabCase {
    param([Parameter(Mandatory = $true)][string]$PascalCaseValue)

    $tokens = Split-NameTokens -Value $PascalCaseValue
    return (($tokens | ForEach-Object { $_.ToLowerInvariant() }) -join "-")
}

function ConvertTo-Title {
    param([Parameter(Mandatory = $true)][string]$PascalCaseValue)

    $tokens = Split-NameTokens -Value $PascalCaseValue
    return ($tokens -join " ")
}

function Resolve-FeatureNames {
    param([Parameter(Mandatory = $true)][string]$RawName)

    $pascal = ConvertTo-PascalCase -Value $RawName

    if (-not $pascal.EndsWith("Feature", [System.StringComparison]::Ordinal)) {
        $pascal = "$pascal`Feature"
    }

    $baseName = $pascal.Substring(0, $pascal.Length - "Feature".Length)

    if ([string]::IsNullOrWhiteSpace($baseName)) {
        throw "Feature name must not be only 'Feature'."
    }

    [pscustomobject]@{
        ClassName    = $pascal
        BaseName     = $baseName
        FolderName   = "$(ConvertTo-LowerCamelCase -PascalCaseValue $baseName)Feature"
        FileName     = "$(ConvertTo-LowerCamelCase -PascalCaseValue $baseName)Feature.ts"
        ViewFileName = "$(ConvertTo-LowerCamelCase -PascalCaseValue $baseName)Feature.view.html"
        ViewId       = ConvertTo-KebabCase -PascalCaseValue $baseName
        DefaultTitle = ConvertTo-Title -PascalCaseValue $baseName
    }
}

function Add-FeatureToCatalog {
    param(
        [Parameter(Mandatory = $true)][string]$CatalogPath,
        [Parameter(Mandatory = $true)][string]$FeatureClassName,
        [Parameter(Mandatory = $true)][string]$FeatureFolderName,
        [Parameter(Mandatory = $true)][string]$FeatureFileName
    )

    $content = Get-Content -LiteralPath $CatalogPath -Raw
    $next = $content

    $importFileName = $FeatureFileName -replace '\.ts$', '.js'
    $importLine = "import { $FeatureClassName } from `"../features/$FeatureFolderName/$importFileName`";"

    if (-not $next.Contains($importLine)) {
        $importMatches = [System.Text.RegularExpressions.Regex]::Matches(
            $next,
            '(?m)^import .+;\r?$'
        )

        if ($importMatches.Count -eq 0) {
            throw "No import block found in ViewFeatureCatalog.ts"
        }

        $lastImport = $importMatches[$importMatches.Count - 1]
        $insertAt = $lastImport.Index + $lastImport.Length

        $next = $next.Insert($insertAt, [Environment]::NewLine + $importLine)
    }

    if (-not $next.Contains("new $FeatureClassName()")) {
        $needle = "new SoundTestFeature(),"

        if ($next.Contains($needle)) {
            $next = $next.Replace(
                $needle,
                $needle + [Environment]::NewLine + "    new $FeatureClassName(),"
            )
        }
        else {
            $pattern = '(return\s+new\s+ViewFeatureCatalog\s*\(\s*\[[\s\S]*?)(\s*\]\s*\)\s*;)'

            if (-not [System.Text.RegularExpressions.Regex]::IsMatch($next, $pattern)) {
                throw "Could not find ViewFeatureCatalog registration array."
            }

            $next = [System.Text.RegularExpressions.Regex]::Replace(
                $next,
                $pattern,
                {
                    param($match)

                    $prefix = $match.Groups[1].Value.TrimEnd()
                    $suffix = $match.Groups[2].Value

                    return $prefix + [Environment]::NewLine + "    new $FeatureClassName()," + $suffix
                },
                1
            )
        }
    }

    if ($next -eq $content) {
        Write-Host "Unchanged: $CatalogPath"
        return
    }

    Backup-File -Path $CatalogPath
    [System.IO.File]::WriteAllText($CatalogPath, $next, $Utf8NoBom)
    Write-Host "Patched:   $CatalogPath"
}

Assert-Directory -Path $ModuleBasicRoot
Assert-Directory -Path $SrcRoot
Assert-Directory -Path $FeaturesRoot
Assert-Directory -Path $InfrastructureRoot
Assert-File -Path $ViewFeatureCatalogPath

$names = Resolve-FeatureNames -RawName $Name

$featureTitle = if ([string]::IsNullOrWhiteSpace($Title)) {
    $names.DefaultTitle
}
else {
    $Title.Trim()
}

$featureDescription = if ([string]::IsNullOrWhiteSpace($Description)) {
    "Feature view for $featureTitle."
}
else {
    $Description.Trim()
}

$FeatureRoot = Join-Path $FeaturesRoot $names.FolderName

$viewContent = @'
<h1>__FEATURE_TITLE__</h1>
<p>__FEATURE_DESCRIPTION__</p>
'@
$viewContent = $viewContent.
    Replace("__FEATURE_TITLE__", $featureTitle).
    Replace("__FEATURE_DESCRIPTION__", $featureDescription)

$featureContent = @'
import { html, type TemplateResult } from "lit";

import type { IViewFeature } from "../../infrastructure/IViewFeature.js";

export class __FEATURE_CLASS__ implements IViewFeature {
  public readonly id = "__FEATURE_ID__";

  public renderNavigationTemplate(): TemplateResult {
    return html`<span>__FEATURE_TITLE__</span>`;
  }

  public async loadViewHtml(): Promise<string> {
    const module = await import("./__VIEW_FILE__?raw");
    return module.default;
  }
}
'@
$featureContent = $featureContent.
    Replace("__FEATURE_CLASS__", $names.ClassName).
    Replace("__FEATURE_ID__", $names.ViewId).
    Replace("__FEATURE_TITLE__", $featureTitle).
    Replace("__VIEW_FILE__", $names.ViewFileName)

$indexContent = @'
export * from "./__FEATURE_IMPORT_FILE__";
'@
$indexContent = $indexContent.Replace(
    "__FEATURE_IMPORT_FILE__",
    ($names.FileName -replace '\.ts$', '.js')
)

Write-Utf8File `
    -Path (Join-Path $FeatureRoot $names.ViewFileName) `
    -Content $viewContent

Write-Utf8File `
    -Path (Join-Path $FeatureRoot $names.FileName) `
    -Content $featureContent

Write-Utf8File `
    -Path (Join-Path $FeatureRoot "index.ts") `
    -Content $indexContent

Add-FeatureToCatalog `
    -CatalogPath $ViewFeatureCatalogPath `
    -FeatureClassName $names.ClassName `
    -FeatureFolderName $names.FolderName `
    -FeatureFileName $names.FileName

Write-Host ""
Write-Host "Done."
Write-Host "Application feature:"
Write-Host "  Class:  $($names.ClassName)"
Write-Host "  Id:     $($names.ViewId)"
Write-Host "  Folder: src\features\$($names.FolderName)"
Write-Host ""
Write-Host "Run:"
Write-Host "  pnpm build"