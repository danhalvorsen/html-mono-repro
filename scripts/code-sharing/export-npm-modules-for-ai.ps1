# FILE: export-npm-modules-for-ai.ps1

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$Root = (Get-Location).Path,

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$OutputRoot = (Join-Path (Get-Location).Path ".ai-share"),

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$OutputFileName = "npm-modules.ai-code.txt",

    [Parameter(Mandatory = $false)]
    [switch]$IncludeTests,

    [Parameter(Mandatory = $false)]
    [switch]$IncludeConfigs,

    [Parameter(Mandatory = $false)]
    [string[]]$SourceFolderNames = @("src"),

    [Parameter(Mandatory = $false)]
    [string[]]$TestFolderNames = @("test", "tests", "__tests__"),

    [Parameter(Mandatory = $false)]
    [string[]]$ConfigFileNames = @(
        "package.json",
        "tsconfig.json",
        "tsconfig.build.json",
        "vite.config.ts",
        "vite.config.mts",
        "vite.config.js",
        "vitest.config.ts",
        "vitest.config.mts",
        "vitest.ts"
    ),

    [Parameter(Mandatory = $false)]
    [string[]]$AllowedExtensions = @(
        ".ts",
        ".tsx",
        ".js",
        ".jsx",
        ".mts",
        ".cts",
        ".mjs",
        ".cjs",
        ".json",
        ".html",
        ".css",
        ".scss",
        ".sass",
        ".md",
        ".yml",
        ".yaml",
        ".ps1"
    ),

    [Parameter(Mandatory = $false)]
    [string[]]$ExcludedDirectoryNames = @(
        ".git",
        ".turbo",
        ".vite",
        ".next",
        ".nuxt",
        ".cache",
        ".output",
        ".ai-share",
        "node_modules",
        "dist",
        "build",
        "coverage"
    )
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Test-IsExcludedPath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [string[]]$ExcludedNames
    )

    $excluded = [System.Collections.Generic.HashSet[string]]::new(
        [System.StringComparer]::OrdinalIgnoreCase
    )

    foreach ($name in $ExcludedNames) {
        [void]$excluded.Add($name)
    }

    $parts = $Path -split '[\\/]' | Where-Object { $_ -ne "" }

    foreach ($part in $parts) {
        if ($excluded.Contains($part)) {
            return $true
        }
    }

    return $false
}

function Read-FileTextOrEmpty {
    param(
        [Parameter(Mandatory = $true)]
        [string]$FilePath
    )

    if (-not (Test-Path -LiteralPath $FilePath -PathType Leaf)) {
        return ""
    }

    return [System.IO.File]::ReadAllText($FilePath)
}

function Get-PackageName {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PackageJsonPath
    )

    $fallbackName = [System.IO.Path]::GetFileName(
        (Split-Path -Parent $PackageJsonPath)
    )

    try {
        $jsonText = Read-FileTextOrEmpty -FilePath $PackageJsonPath

        if ([string]::IsNullOrWhiteSpace($jsonText)) {
            return $fallbackName
        }

        $json = $jsonText | ConvertFrom-Json

        if ($null -ne $json.name -and -not [string]::IsNullOrWhiteSpace([string]$json.name)) {
            return [string]$json.name
        }

        return $fallbackName
    }
    catch {
        return $fallbackName
    }
}

function Get-RelativePath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$BasePath,

        [Parameter(Mandatory = $true)]
        [string]$TargetPath
    )

    $baseResolved = (Resolve-Path -LiteralPath $BasePath).Path
    $targetResolved = (Resolve-Path -LiteralPath $TargetPath).Path

    $baseUri = [System.Uri]::new(
        $baseResolved.TrimEnd('\', '/') + [System.IO.Path]::DirectorySeparatorChar
    )

    $targetUri = [System.Uri]::new($targetResolved)

    return [System.Uri]::UnescapeDataString(
        $baseUri.MakeRelativeUri($targetUri).ToString()
    ).Replace("/", [System.IO.Path]::DirectorySeparatorChar)
}

function Get-CommentHeader {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RelativePath
    )

    $extension = [System.IO.Path]::GetExtension($RelativePath).ToLowerInvariant()

    switch ($extension) {
        ".html" { return "<!-- FILE: $RelativePath -->" }
        ".xml"  { return "<!-- FILE: $RelativePath -->" }
        ".md"   { return "<!-- FILE: $RelativePath -->" }
        ".css"  { return "/* FILE: $RelativePath */" }
        ".scss" { return "/* FILE: $RelativePath */" }
        ".sass" { return "/* FILE: $RelativePath */" }
        ".ps1"  { return "# FILE: $RelativePath" }
        ".psm1" { return "# FILE: $RelativePath" }
        ".sh"   { return "# FILE: $RelativePath" }
        ".yml"  { return "# FILE: $RelativePath" }
        ".yaml" { return "# FILE: $RelativePath" }
        default { return "// FILE: $RelativePath" }
    }
}

function Get-FilesFromFolder {
    param(
        [Parameter(Mandatory = $true)]
        [string]$FolderPath,

        [Parameter(Mandatory = $true)]
        [string[]]$AllowedExtensions,

        [Parameter(Mandatory = $true)]
        [string[]]$ExcludedDirectoryNames
    )

    if (-not (Test-Path -LiteralPath $FolderPath -PathType Container)) {
        return @()
    }

    return Get-ChildItem -LiteralPath $FolderPath -Recurse -File -ErrorAction Stop |
        Where-Object {
            -not (Test-IsExcludedPath -Path $_.FullName -ExcludedNames $ExcludedDirectoryNames) -and
            ($AllowedExtensions -contains $_.Extension.ToLowerInvariant())
        }
}

function Get-ConfigFiles {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ModulePath,

        [Parameter(Mandatory = $true)]
        [string[]]$ConfigFileNames
    )

    $files = [System.Collections.Generic.List[System.IO.FileInfo]]::new()

    foreach ($fileName in $ConfigFileNames) {
        $path = Join-Path $ModulePath $fileName

        if (Test-Path -LiteralPath $path -PathType Leaf) {
            $files.Add([System.IO.FileInfo]::new($path))
        }
    }

    return $files
}

function Get-ModuleFiles {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ModulePath,

        [Parameter(Mandatory = $true)]
        [string[]]$SourceFolderNames,

        [Parameter(Mandatory = $true)]
        [string[]]$TestFolderNames,

        [Parameter(Mandatory = $true)]
        [bool]$ShouldIncludeTests,

        [Parameter(Mandatory = $true)]
        [bool]$ShouldIncludeConfigs,

        [Parameter(Mandatory = $true)]
        [string[]]$ConfigFileNames,

        [Parameter(Mandatory = $true)]
        [string[]]$AllowedExtensions,

        [Parameter(Mandatory = $true)]
        [string[]]$ExcludedDirectoryNames
    )

    $files = [System.Collections.Generic.List[System.IO.FileInfo]]::new()

    if ($ShouldIncludeConfigs) {
        foreach ($file in Get-ConfigFiles -ModulePath $ModulePath -ConfigFileNames $ConfigFileNames) {
            $files.Add($file)
        }
    }

    foreach ($folderName in $SourceFolderNames) {
        $folderPath = Join-Path $ModulePath $folderName

        foreach ($file in Get-FilesFromFolder -FolderPath $folderPath -AllowedExtensions $AllowedExtensions -ExcludedDirectoryNames $ExcludedDirectoryNames) {
            $files.Add($file)
        }
    }

    if ($ShouldIncludeTests) {
        foreach ($folderName in $TestFolderNames) {
            $folderPath = Join-Path $ModulePath $folderName

            foreach ($file in Get-FilesFromFolder -FolderPath $folderPath -AllowedExtensions $AllowedExtensions -ExcludedDirectoryNames $ExcludedDirectoryNames) {
                $files.Add($file)
            }
        }
    }

    return $files | Sort-Object FullName -Unique
}

function Get-NpmModules {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Root,

        [Parameter(Mandatory = $true)]
        [string[]]$ExcludedDirectoryNames
    )

    return Get-ChildItem -LiteralPath $Root -Recurse -File -Filter "package.json" -ErrorAction Stop |
        Where-Object {
            -not (Test-IsExcludedPath -Path $_.FullName -ExcludedNames $ExcludedDirectoryNames)
        } |
        ForEach-Object {
            [PSCustomObject]@{
                PackageJsonPath = $_.FullName
                ModulePath      = Split-Path -Parent $_.FullName
                PackageName     = Get-PackageName -PackageJsonPath $_.FullName
            }
        } |
        Sort-Object ModulePath
}

function Add-ModuleToOutput {
    param(
        [Parameter(Mandatory = $true)]
        [System.Text.StringBuilder]$Builder,

        [Parameter(Mandatory = $true)]
        [string]$ModulePath,

        [Parameter(Mandatory = $true)]
        [string]$PackageName,

        [Parameter(Mandatory = $true)]
        [System.IO.FileInfo[]]$Files
    )

    [void]$Builder.AppendLine()
    [void]$Builder.AppendLine("################################################################################")
    [void]$Builder.AppendLine("// MODULE: $PackageName")
    [void]$Builder.AppendLine("// MODULE_PATH: $ModulePath")
    [void]$Builder.AppendLine("################################################################################")
    [void]$Builder.AppendLine()

    foreach ($file in $Files) {
        $relativePath = Get-RelativePath -BasePath $ModulePath -TargetPath $file.FullName
        $header = Get-CommentHeader -RelativePath $relativePath
        $content = Read-FileTextOrEmpty -FilePath $file.FullName

        [void]$Builder.AppendLine("================================================================================")
        [void]$Builder.AppendLine($header)
        [void]$Builder.AppendLine()

        if (-not [string]::IsNullOrEmpty($content)) {
            [void]$Builder.AppendLine($content.TrimEnd())
        }

        [void]$Builder.AppendLine()
    }
}

$resolvedRoot = (Resolve-Path -LiteralPath $Root).Path

if (-not (Test-Path -LiteralPath $resolvedRoot -PathType Container)) {
    throw "Root path does not exist: $resolvedRoot"
}

if (-not (Test-Path -LiteralPath $OutputRoot -PathType Container)) {
    New-Item -ItemType Directory -Path $OutputRoot | Out-Null
}

$outputPath = Join-Path $OutputRoot $OutputFileName
$builder = [System.Text.StringBuilder]::new()

[void]$builder.AppendLine("// AI CODE EXPORT")
[void]$builder.AppendLine("// ROOT: $resolvedRoot")
[void]$builder.AppendLine("// GENERATED: $((Get-Date).ToString("yyyy-MM-ddTHH:mm:ssK"))")
[void]$builder.AppendLine("// INCLUDE_TESTS: $($IncludeTests.IsPresent)")
[void]$builder.AppendLine("// INCLUDE_CONFIGS: $($IncludeConfigs.IsPresent)")

$modules = @(Get-NpmModules -Root $resolvedRoot -ExcludedDirectoryNames $ExcludedDirectoryNames)

$exportedModuleCount = 0
$exportedFileCount = 0

foreach ($module in $modules) {
    $files = @(
        Get-ModuleFiles `
            -ModulePath $module.ModulePath `
            -SourceFolderNames $SourceFolderNames `
            -TestFolderNames $TestFolderNames `
            -ShouldIncludeTests $IncludeTests.IsPresent `
            -ShouldIncludeConfigs $IncludeConfigs.IsPresent `
            -ConfigFileNames $ConfigFileNames `
            -AllowedExtensions $AllowedExtensions `
            -ExcludedDirectoryNames $ExcludedDirectoryNames
    )

    if ($files.Count -eq 0) {
        continue
    }

    Add-ModuleToOutput `
        -Builder $builder `
        -ModulePath $module.ModulePath `
        -PackageName $module.PackageName `
        -Files $files

    $exportedModuleCount++
    $exportedFileCount += $files.Count
}

[System.IO.File]::WriteAllText(
    $outputPath,
    $builder.ToString(),
    [System.Text.UTF8Encoding]::new($false)
)

Write-Host "Exported modules: $exportedModuleCount"
Write-Host "Exported files:   $exportedFileCount"
Write-Host "Output:           $outputPath"