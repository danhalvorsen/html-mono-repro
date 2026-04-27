
[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$TargetRoot = "C:\Users\danha\source\repos\HTML\MonoRepro\packages\Audio\project-x-ray-sound-magic\music-core-synthesizer\functional-modules\midi-streamer",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$PackageScope = "@monorepo",

    [Parameter(Mandatory = $false)]
    [switch]$Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function New-DirectoryIfMissing {
    param(
        [Parameter(Mandatory = $true)]
        [ValidateNotNullOrEmpty()]
        [string]$Path
    )

    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Path $Path | Out-Null
    }
}

function Write-Utf8NoBomFile {
    param(
        [Parameter(Mandatory = $true)]
        [ValidateNotNullOrEmpty()]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [AllowEmptyString()]
        [string]$Content,

        [Parameter(Mandatory = $false)]
        [switch]$Overwrite
    )

    if ((Test-Path -LiteralPath $Path) -and -not $Overwrite) {
        Write-Verbose "Skipping existing file: $Path"
        return
    }

    $directory = Split-Path -Parent $Path
    New-DirectoryIfMissing -Path $directory

    $encoding = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Content, $encoding)
}

function ConvertTo-StableJson {
    param(
        [Parameter(Mandatory = $true)]
        [object]$Value
    )

    return ($Value | ConvertTo-Json -Depth 32)
}

function New-PackageJson {
    param(
        [Parameter(Mandatory = $true)]
        [ValidateNotNullOrEmpty()]
        [string]$PackageName,

        [Parameter(Mandatory = $true)]
        [hashtable]$Dependencies,

        [Parameter(Mandatory = $false)]
        [hashtable]$DevDependencies = @{}
    )

    $package = [ordered]@{
        name = $PackageName
        version = "1.0.0"
        description = ""
        type = "module"
        main = "./dist/index.js"
        types = "./dist/index.d.ts"
        exports = [ordered]@{
            "." = [ordered]@{
                types = "./dist/index.d.ts"
                import = "./dist/index.js"
            }
        }
        files = @(
            "dist"
        )
        scripts = [ordered]@{
            clean = "rimraf dist"
            build = "tsc -p tsconfig.json"
            test = "vitest run"
            "test:typecheck" = "vitest run --typecheck"
        }
        keywords = @(
            "audio"
            "midi"
            "streamer"
            "synthesizer"
        )
        license = "MIT"
        dependencies = [ordered]@{}
        devDependencies = [ordered]@{}
    }

    foreach ($key in ($Dependencies.Keys | Sort-Object)) {
        $package.dependencies[$key] = $Dependencies[$key]
    }

    foreach ($key in ($DevDependencies.Keys | Sort-Object)) {
        $package.devDependencies[$key] = $DevDependencies[$key]
    }

    return ConvertTo-StableJson -Value $package
}

function New-TsConfigJson {
    $config = [ordered]@{
        compilerOptions = [ordered]@{
            target = "ES2022"
            module = "NodeNext"
            moduleResolution = "NodeNext"
            declaration = $true
            declarationMap = $true
            sourceMap = $true
            outDir = "./dist"
            rootDir = "./src"
            strict = $true
            noImplicitOverride = $true
            noUncheckedIndexedAccess = $true
            exactOptionalPropertyTypes = $true
            forceConsistentCasingInFileNames = $true
            skipLibCheck = $true
        }
        include = @(
            "src/**/*.ts"
        )
        exclude = @(
            "dist"
            "node_modules"
            "tests"
        )
    }

    return ConvertTo-StableJson -Value $config
}

function New-Readme {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Title,

        [Parameter(Mandatory = $true)]
        [string]$Responsibility
    )

    $lines = @(
        "# $Title",
        "",
        "## Responsibility",
        "",
        $Responsibility,
        "",
        "## Package Role",
        "",
        "This package belongs to the MIDI Streamer feature module group.",
        "",
        "````text",
        "audio-function-midi-streamer-contracts",
        "audio-function-midi-streamer",
        "audio-function-midi-streamer-ui",
        "audio-function-midi-streamer-web-audio",
        "````",
        "",
        "## Architecture Rule",
        "",
        "Keep dependencies pointing inward.",
        "",
        "Domain/application code must not depend on DOM, Lit, Web Audio, or browser MIDI APIs."
    )

    return ($lines -join [Environment]::NewLine)
}

function New-IndexFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PackageRole
    )

    $lines = @(
        "// $PackageRole",
        "// Public package entry point.",
        "// Add intentional exports only.",
        "",
        "export {};"
    )

    return ($lines -join [Environment]::NewLine)
}