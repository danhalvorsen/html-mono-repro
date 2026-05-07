# FILE: code.ps1
# Run from: Applications/game/game-scroller

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$GameScrollerRoot = (Get-Location).Path
$GameModulesRoot = Split-Path -Parent $GameScrollerRoot

$ShapesPackageName = "@monorepo/game-assets-shapes"
$ShapesModuleRoot = Join-Path $GameModulesRoot "game-assets-shapes"
$ShapesSrcRoot = Join-Path $ShapesModuleRoot "src"

$GameScrollerPackageJson = Join-Path $GameScrollerRoot "package.json"
$SourcePolygonFolder = Join-Path $GameScrollerRoot "src\Game\Elements\Polygon"

$ShapeFiles = @(
    "GamePolygon.ts",
    "SvgPolygon.ts",
    "SvgOpenPolygon.ts",
    "SvgPolygonBuilder.ts"
)

function Assert-FileExists {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Path
    )

    if (-not (Test-Path $Path)) {
        throw "Expected file was not found: $Path"
    }
}

function Ensure-Directory {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Path
    )

    if (-not (Test-Path $Path)) {
        New-Item -ItemType Directory -Path $Path | Out-Null
        Write-Host "Created folder: $Path"
    }
}

function Write-CodeFile {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Path,

        [Parameter(Mandatory = $true)]
        [string] $Content
    )

    Ensure-Directory -Path (Split-Path -Parent $Path)
    Set-Content -Path $Path -Value $Content -Encoding UTF8
    Write-Host "Written: $Path"
}

function Read-TextFile {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Path
    )

    Assert-FileExists -Path $Path
    return Get-Content -Path $Path -Raw
}

function Save-TextFile {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Path,

        [Parameter(Mandatory = $true)]
        [string] $Content
    )

    Set-Content -Path $Path -Value $Content -Encoding UTF8
    Write-Host "Patched: $Path"
}

function Replace-TextInFile {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Path,

        [Parameter(Mandatory = $true)]
        [string] $Search,

        [Parameter(Mandatory = $true)]
        [string] $Replacement
    )

    if (-not (Test-Path $Path)) {
        return
    }

    $content = Get-Content -Path $Path -Raw
    $nextContent = $content.Replace($Search, $Replacement)

    if ($nextContent -eq $content) {
        return
    }

    Save-TextFile -Path $Path -Content $nextContent
}

function Replace-RegexInFile {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Path,

        [Parameter(Mandatory = $true)]
        [string] $Pattern,

        [Parameter(Mandatory = $true)]
        [string] $Replacement
    )

    if (-not (Test-Path $Path)) {
        return
    }

    $content = Get-Content -Path $Path -Raw
    $nextContent = [regex]::Replace($content, $Pattern, $Replacement)

    if ($nextContent -eq $content) {
        return
    }

    Save-TextFile -Path $Path -Content $nextContent
}

function Remove-RegexFromFile {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Path,

        [Parameter(Mandatory = $true)]
        [string] $Pattern
    )

    if (-not (Test-Path $Path)) {
        return
    }

    $content = Get-Content -Path $Path -Raw
    $nextContent = [regex]::Replace($content, $Pattern, "")

    if ($nextContent -eq $content) {
        return
    }

    Save-TextFile -Path $Path -Content $nextContent
}

function Move-ShapeFile {
    param(
        [Parameter(Mandatory = $true)]
        [string] $FileName
    )

    $sourcePath = Join-Path $SourcePolygonFolder $FileName
    $targetPath = Join-Path $ShapesSrcRoot $FileName

    if ((Test-Path $sourcePath) -and (Test-Path $targetPath)) {
        Remove-Item -Path $sourcePath -Force
        Write-Host "Removed duplicate source after previous partial move: $sourcePath"
        return
    }

    if (Test-Path $targetPath) {
        Write-Host "Already moved: $targetPath"
        return
    }

    Assert-FileExists -Path $sourcePath
    Ensure-Directory -Path $ShapesSrcRoot
    Move-Item -Path $sourcePath -Destination $targetPath
    Write-Host "Moved: $sourcePath -> $targetPath"
}

function Get-PackageVersionOrDefault {
    param(
        [Parameter(Mandatory = $true)]
        [pscustomobject] $PackageJson,

        [Parameter(Mandatory = $true)]
        [string] $Name,

        [Parameter(Mandatory = $true)]
        [string] $DefaultValue
    )

    $dependency = $PackageJson.dependencies.PSObject.Properties |
        Where-Object { $_.Name -eq $Name } |
        Select-Object -First 1

    if ($null -ne $dependency) {
        return [string] $dependency.Value
    }

    $devDependency = $PackageJson.devDependencies.PSObject.Properties |
        Where-Object { $_.Name -eq $Name } |
        Select-Object -First 1

    if ($null -ne $devDependency) {
        return [string] $devDependency.Value
    }

    return $DefaultValue
}

function Ensure-PackageDependency {
    param(
        [Parameter(Mandatory = $true)]
        [string] $PackageJsonPath,

        [Parameter(Mandatory = $true)]
        [string] $DependencyName,

        [Parameter(Mandatory = $true)]
        [string] $Version
    )

    Assert-FileExists -Path $PackageJsonPath

    $packageJson = Get-Content -Path $PackageJsonPath -Raw | ConvertFrom-Json

    if ($null -eq $packageJson.dependencies) {
        $packageJson | Add-Member -MemberType NoteProperty -Name "dependencies" -Value ([pscustomobject]@{})
    }

    $existing = $packageJson.dependencies.PSObject.Properties |
        Where-Object { $_.Name -eq $DependencyName } |
        Select-Object -First 1

    if ($null -eq $existing) {
        $packageJson.dependencies | Add-Member -MemberType NoteProperty -Name $DependencyName -Value $Version
    }
    else {
        $packageJson.dependencies.$DependencyName = $Version
    }

    $packageJson |
        ConvertTo-Json -Depth 32 |
        Set-Content -Path $PackageJsonPath -Encoding UTF8

    Write-Host "Dependency ensured: $DependencyName -> $Version"
}

function Normalize-NewShapeModuleImports {
    Replace-TextInFile `
        -Path (Join-Path $ShapesSrcRoot "GamePolygon.ts") `
        -Search "import { SvgPolygon } from './SvgPolygon';" `
        -Replacement 'import { SvgPolygon } from "./SvgPolygon.js";'

    Replace-TextInFile `
        -Path (Join-Path $ShapesSrcRoot "GamePolygon.ts") `
        -Search "import { SvgPolygon } from './SvgPolygon.js';" `
        -Replacement 'import { SvgPolygon } from "./SvgPolygon.js";'

    Replace-TextInFile `
        -Path (Join-Path $ShapesSrcRoot "SvgPolygon.ts") `
        -Search "import type { ISvgTemplate, IPolygon, SvgPolygonStyle } from './GamePolygon';" `
        -Replacement 'import type { ISvgTemplate, IPolygon, SvgPolygonStyle } from "./GamePolygon.js";'

    Replace-TextInFile `
        -Path (Join-Path $ShapesSrcRoot "SvgPolygon.ts") `
        -Search "import type { ISvgTemplate, IPolygon, SvgPolygonStyle } from './GamePolygon.js';" `
        -Replacement 'import type { ISvgTemplate, IPolygon, SvgPolygonStyle } from "./GamePolygon.js";'

    Replace-TextInFile `
        -Path (Join-Path $ShapesSrcRoot "SvgOpenPolygon.ts") `
        -Search "import type { IPolygon, SvgPolygonStyle } from './GamePolygon';" `
        -Replacement 'import type { IPolygon, SvgPolygonStyle } from "./GamePolygon.js";'

    Replace-TextInFile `
        -Path (Join-Path $ShapesSrcRoot "SvgOpenPolygon.ts") `
        -Search "import type { IPolygon, SvgPolygonStyle } from './GamePolygon.js';" `
        -Replacement 'import type { IPolygon, SvgPolygonStyle } from "./GamePolygon.js";'

    Replace-TextInFile `
        -Path (Join-Path $ShapesSrcRoot "SvgOpenPolygon.ts") `
        -Search "import { SvgPolygon } from './SvgPolygon';" `
        -Replacement 'import { SvgPolygon } from "./SvgPolygon.js";'

    Replace-TextInFile `
        -Path (Join-Path $ShapesSrcRoot "SvgOpenPolygon.ts") `
        -Search "import { SvgPolygon } from './SvgPolygon.js';" `
        -Replacement 'import { SvgPolygon } from "./SvgPolygon.js";'

    Replace-TextInFile `
        -Path (Join-Path $ShapesSrcRoot "SvgPolygonBuilder.ts") `
        -Search "from './GamePolygon';" `
        -Replacement 'from "./GamePolygon.js";'

    Replace-TextInFile `
        -Path (Join-Path $ShapesSrcRoot "SvgPolygonBuilder.ts") `
        -Search "from './GamePolygon.js';" `
        -Replacement 'from "./GamePolygon.js";'

    Replace-TextInFile `
        -Path (Join-Path $ShapesSrcRoot "SvgPolygonBuilder.ts") `
        -Search "import { SvgPolygon } from './SvgPolygon';" `
        -Replacement 'import { SvgPolygon } from "./SvgPolygon.js";'

    Replace-TextInFile `
        -Path (Join-Path $ShapesSrcRoot "SvgPolygonBuilder.ts") `
        -Search "import { SvgPolygon } from './SvgPolygon.js';" `
        -Replacement 'import { SvgPolygon } from "./SvgPolygon.js";'
}

function Patch-GameScrollerImports {
    $multiCurvePath = Join-Path $SourcePolygonFolder "MultiCurveSvgTemplate.ts"

    if (Test-Path $multiCurvePath) {
        Remove-RegexFromFile `
            -Path $multiCurvePath `
            -Pattern '(?m)^\s*import\s+\{\s*type\s+ISvgTemplate,\s*Polygon\s*\}\s+from\s+["'']\.\/GamePolygon(?:\.js)?["''];\s*\r?\n?'

        Remove-RegexFromFile `
            -Path $multiCurvePath `
            -Pattern '(?m)^\s*import\s+\{\s*SvgOpenPolygon\s*\}\s+from\s+["'']\.\/SvgOpenPolygon(?:\.js)?["''];\s*\r?\n?'

        Remove-RegexFromFile `
            -Path $multiCurvePath `
            -Pattern '(?m)^\s*import\s+\{\s*SvgPolygon\s*\}\s+from\s+["'']\.\/SvgPolygon(?:\.js)?["''];\s*\r?\n?'

        $content = Get-Content -Path $multiCurvePath -Raw

        if ($content -notmatch '@monorepo/game-assets-shapes') {
            $content =
                'import { type ISvgTemplate, Polygon, SvgOpenPolygon, SvgPolygon } from "@monorepo/game-assets-shapes";' +
                [Environment]::NewLine +
                $content.TrimStart()

            Save-TextFile -Path $multiCurvePath -Content $content
        }
    }

    $builderReExportPath = Join-Path $GameScrollerRoot "src\Game\Builders\SvgPolygonBuilder.ts"
    if (Test-Path $builderReExportPath) {
        Write-CodeFile -Path $builderReExportPath -Content @'
export * from "@monorepo/game-assets-shapes";
'@
    }

    $gameIndexPath = Join-Path $GameScrollerRoot "src\Game\index.ts"
    if (Test-Path $gameIndexPath) {
        Remove-RegexFromFile `
            -Path $gameIndexPath `
            -Pattern '(?m)^\s*export\s+\*\s+from\s+["'']\.\/Elements\/Polygon\/GamePolygon\.js["''];\s*\r?\n?'

        $content = Get-Content -Path $gameIndexPath -Raw

        if ($content -notmatch 'export\s+\*\s+from\s+["'']@monorepo/game-assets-shapes["''];') {
            $content = $content.TrimEnd() + [Environment]::NewLine + 'export * from "@monorepo/game-assets-shapes";' + [Environment]::NewLine
            Save-TextFile -Path $gameIndexPath -Content $content
        }
    }

    $svgPolygonTemplatePath = Join-Path $GameScrollerRoot "src\GameObjects\SvgPolygonTemplate.ts"
    if (Test-Path $svgPolygonTemplatePath) {
        Remove-RegexFromFile `
            -Path $svgPolygonTemplatePath `
            -Pattern '(?m)^\s*import\s+\{\s*Polygon\s*\}\s+from\s+["'']\.\.\/Game\/Elements\/Polygon\/GamePolygon\.js["''];\s*\r?\n?'

        Remove-RegexFromFile `
            -Path $svgPolygonTemplatePath `
            -Pattern '(?m)^\s*import\s+\{\s*SvgPolygon\s*\}\s+from\s+["'']\.\.\/Game\/Elements\/Polygon\/SvgPolygon\.js["''];\s*\r?\n?'

        $content = Get-Content -Path $svgPolygonTemplatePath -Raw

        if ($content -notmatch '@monorepo/game-assets-shapes') {
            $content =
                'import { Polygon, SvgPolygon } from "@monorepo/game-assets-shapes";' +
                [Environment]::NewLine +
                $content.TrimStart()

            Save-TextFile -Path $svgPolygonTemplatePath -Content $content
        }
    }

    $viewGamePolygonPath = Join-Path $GameScrollerRoot "src\views\view-game-polygon.ts"
    if (Test-Path $viewGamePolygonPath) {
        Remove-RegexFromFile `
            -Path $viewGamePolygonPath `
            -Pattern '(?m)^\s*import\s+\{\s*Polygon\s*\}\s+from\s+["'']\.\.\/Game\/Elements\/Polygon\/GamePolygon\.js["''];\s*\r?\n?'

        Remove-RegexFromFile `
            -Path $viewGamePolygonPath `
            -Pattern '(?m)^\s*import\s+\{\s*SvgPolygon\s*\}\s+from\s+["'']\.\.\/Game\/Elements\/Polygon\/SvgPolygon\.js["''];\s*\r?\n?'

        $content = Get-Content -Path $viewGamePolygonPath -Raw

        if ($content -notmatch '@monorepo/game-assets-shapes') {
            $content =
                'import { Polygon, SvgPolygon } from "@monorepo/game-assets-shapes";' +
                [Environment]::NewLine +
                $content.TrimStart()

            Save-TextFile -Path $viewGamePolygonPath -Content $content
        }
    }

    $cavePath = Join-Path $GameScrollerRoot "src\Game\Screen\Cave\CaveGameObject.ts"
    if (Test-Path $cavePath) {
        Replace-RegexInFile `
            -Path $cavePath `
            -Pattern 'import\s+type\s+\{\s*GamePolygon\s*\}\s+from\s+["'']\.\.\/\.\.\/Elements\/Polygon\/GamePolygon\.js["''];' `
            -Replacement 'import type { GamePolygon } from "@monorepo/game-assets-shapes";'
    }
}

Assert-FileExists -Path $GameScrollerPackageJson
Ensure-Directory -Path $ShapesSrcRoot

foreach ($file in $ShapeFiles) {
    Move-ShapeFile -FileName $file
}

$gameScrollerPackage = Get-Content -Path $GameScrollerPackageJson -Raw | ConvertFrom-Json
$litVersion = Get-PackageVersionOrDefault -PackageJson $gameScrollerPackage -Name "lit" -DefaultValue "^3.0.0"
$typescriptVersion = Get-PackageVersionOrDefault -PackageJson $gameScrollerPackage -Name "typescript" -DefaultValue "^5.0.0"

Write-CodeFile -Path (Join-Path $ShapesModuleRoot "package.json") -Content @"
{
  "name": "$ShapesPackageName",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsc"
  },
  "dependencies": {
    "@monorepo/core-math": "workspace:*",
    "lit": "$litVersion"
  },
  "devDependencies": {
    "typescript": "$typescriptVersion"
  }
}
"@

Write-CodeFile -Path (Join-Path $ShapesModuleRoot "tsconfig.json") -Content @'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "rootDir": "src",
    "lib": ["ES2022", "DOM"],
    "skipLibCheck": true,
    "noUncheckedIndexedAccess": true
  },
  "include": ["src/**/*.ts"]
}
'@

Write-CodeFile -Path (Join-Path $ShapesSrcRoot "index.ts") -Content @'
export {
  GamePolygon,
  Polygon,
  type IPolygon,
  type ISvgTemplate,
  type SvgPolygonStyle,
} from "./GamePolygon.js";

export { SvgPolygon } from "./SvgPolygon.js";
export { SvgOpenPolygon } from "./SvgOpenPolygon.js";

export {
  SvgPolygonBuilder,
  SvgRectangleBuilder,
  type IBuilder,
  type PointMapper,
  type PolygonBuilderOptions,
} from "./SvgPolygonBuilder.js";
'@

Normalize-NewShapeModuleImports
Patch-GameScrollerImports

Ensure-PackageDependency `
    -PackageJsonPath $GameScrollerPackageJson `
    -DependencyName $ShapesPackageName `
    -Version "workspace:*"

Write-Host "Shape migration completed."
Write-Host "Run:"
Write-Host "  pnpm --filter $ShapesPackageName build"
Write-Host "  pnpm --filter game-scroller build"