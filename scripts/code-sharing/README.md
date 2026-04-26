```powershell
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
    [switch]$IncludeTests,

    [Parameter(Mandatory = $false)]
    [switch]$IncludeConfigs,

    [Parameter(Mandatory = $false)]
    [string[]]$SourceFolderNames = @("src"),

    [Parameter(Mandatory = $false)]
    [string[]]$TestFolderNames = @("test", "tests"),

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
        ".yaml"
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
        "node_modules",
        "dist",
        "build",
        "coverage"
    ),

    [Parameter(Mandatory = $false)]
    [string]$OutputFileExtension = ".ai-code.txt"
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

    $parts = $Path -split '[\\/]' | Where-Object { $_ -ne "" }

    foreach ($part in $parts) {
        if ($ExcludedNames -contains $part) {
            return $true
        }
    }

    return $false
}

function Get-SafeFileName {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Value
    )

    $invalidChars = [System.IO.Path]::GetInvalidFileNameChars()
    $result = $Value

    foreach ($char in $invalidChars) {
        $result = $result.Replace($char, "_")
    }

    return $result.Replace("@", "").Replace("/", "__").Replace("\", "__")
}

function Get-PackageName {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PackageJsonPath
    )

    try {
        $json = Get-Content -LiteralPath $PackageJsonPath -Raw | ConvertFrom-Json

        if ($null -ne $json.name -and -not [string]::IsNullOrWhiteSpace([string]$json.name)) {
            return [string]$json.name
        }
    }
    catch {
        return [System.IO.Path]::GetFileName((Split-Path -Parent $PackageJsonPath))
    }

    return [System.IO.Path]::GetFileName((Split-Path -Parent $PackageJsonPath))
}

function Get-RelativePath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$BasePath,

        [Parameter(Mandatory = $true)]
        [string]$TargetPath
    )

    $baseUri = [System.Uri]::new((Resolve-Path -LiteralPath $BasePath).Path.TrimEnd('\', '/') + [System.IO.Path]::DirectorySeparatorChar)
    $targetUri = [System.Uri]::new((Resolve-Path -LiteralPath $TargetPath).Path)

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

    return Get-ChildItem -LiteralPath $FolderPath -Recurse -File |
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

    $files = New-Object System.Collections.Generic.List[System.IO.FileInfo]

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
        [bool]$IncludeTests,

        [Parameter(Mandatory = $true)]
        [bool]$IncludeConfigs,

        [Parameter(Mandatory = $true)]
        [string[]]$ConfigFileNames,

        [Parameter(Mandatory = $true)]
        [string[]]$AllowedExtensions,

        [Parameter(Mandatory = $true)]
        [string[]]$ExcludedDirectoryNames
    )

    $files = New-Object System.Collections.Generic.List[System.IO.FileInfo]

    if ($IncludeConfigs) {
        foreach ($file in (Get-ConfigFiles -ModulePath $ModulePath -ConfigFileNames $ConfigFileNames)) {
            $files.Add($file)
        }
    }

    foreach ($folderName in $SourceFolderNames) {
        $folderPath = Join-Path $ModulePath $folderName

        foreach ($file in (Get-FilesFromFolder -FolderPath $folderPath -AllowedExtensions $AllowedExtensions -ExcludedDirectoryNames $ExcludedDirectoryNames)) {
            $files.Add($file)
        }
    }

    if ($IncludeTests) {
        foreach ($folderName in $TestFolderNames) {
            $folderPath = Join-Path $ModulePath $folderName

            foreach ($file in (Get-FilesFromFolder -FolderPath $folderPath -AllowedExtensions $AllowedExtensions -ExcludedDirectoryNames $ExcludedDirectoryNames)) {
                $files.Add($file)
            }
        }
    }

    return $files |
        Sort-Object FullName -Unique
}

function Write-ModuleAiCodeFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ModulePath,

        [Parameter(Mandatory = $true)]
        [string]$PackageName,

        [Parameter(Mandatory = $true)]
        [System.IO.FileInfo[]]$Files,

        [Parameter(Mandatory = $true)]
        [string]$OutputRoot,

        [Parameter(Mandatory = $true)]
        [string]$OutputFileExtension
    )

    if (-not (Test-Path -LiteralPath $OutputRoot -PathType Container)) {
        New-Item -ItemType Directory -Path $OutputRoot | Out-Null
    }

    $safePackageName = Get-SafeFileName -Value $PackageName
    $outputPath = Join-Path $OutputRoot "$safePackageName$OutputFileExtension"

    $builder = [System.Text.StringBuilder]::new()

    [void]$builder.AppendLine("// MODULE: $PackageName")
    [void]$builder.AppendLine("// PATH: $ModulePath")
    [void]$builder.AppendLine("// GENERATED: $((Get-Date).ToString("yyyy-MM-ddTHH:mm:ssK"))")
    [void]$builder.AppendLine()

    foreach ($file in $Files) {
        $relativePath = Get-RelativePath -BasePath $ModulePath -TargetPath $file.FullName
        $header = Get-CommentHeader -RelativePath $relativePath
        $content = Get-Content -LiteralPath $file.FullName -Raw

        [void]$builder.AppendLine("================================================================================")
        [void]$builder.AppendLine($header)
        [void]$builder.AppendLine()
        [void]$builder.AppendLine($content.TrimEnd())
        [void]$builder.AppendLine()
    }

    [System.IO.File]::WriteAllText(
        $outputPath,
        $builder.ToString(),
        [System.Text.UTF8Encoding]::new($false)
    )

    return $outputPath
}

function Get-NpmModules {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Root,

        [Parameter(Mandatory = $true)]
        [string[]]$ExcludedDirectoryNames
    )

    return Get-ChildItem -LiteralPath $Root -Recurse -File -Filter "package.json" |
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

$resolvedRoot = (Resolve-Path -LiteralPath $Root).Path

if (-not (Test-Path -LiteralPath $resolvedRoot -PathType Container)) {
    throw "Root path does not exist: $resolvedRoot"
}

$modules = @(Get-NpmModules -Root $resolvedRoot -ExcludedDirectoryNames $ExcludedDirectoryNames)

foreach ($module in $modules) {
    $files = @(
        Get-ModuleFiles `
            -ModulePath $module.ModulePath `
            -SourceFolderNames $SourceFolderNames `
            -TestFolderNames $TestFolderNames `
            -IncludeTests:$IncludeTests.IsPresent `
            -IncludeConfigs:$IncludeConfigs.IsPresent `
            -ConfigFileNames $ConfigFileNames `
            -AllowedExtensions $AllowedExtensions `
            -ExcludedDirectoryNames $ExcludedDirectoryNames
    )

    if ($files.Count -eq 0) {
        continue
    }

    $outputPath = Write-ModuleAiCodeFile `
        -ModulePath $module.ModulePath `
        -PackageName $module.PackageName `
        -Files $files `
        -OutputRoot $OutputRoot `
        -OutputFileExtension $OutputFileExtension

    Write-Host "Exported $($module.PackageName) -> $outputPath"
}
```

Run from repo root:

```powershell
.\export-npm-modules-for-ai.ps1
```

Include tests and config files:

```powershell
.\export-npm-modules-for-ai.ps1 -IncludeTests -IncludeConfigs
```

Output:

```text
.ai-share/
  monorepo__some-package.ai-code.txt
  monorepo__another-package.ai-code.txt
```
