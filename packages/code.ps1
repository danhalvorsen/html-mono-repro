# fix-core-tag-syntax-basic-specification-dependency.ps1
#
# Fixes:
#   src/specifications/BasicTagSystemSpecification.ts
#     Cannot find module '@monorepo/core-specifications'
#
# Cause:
#   @monorepo/core-tag-syntax-basic uses Specification<T> directly,
#   but package.json does not declare @monorepo/core-specifications.
#
# Run from anywhere:
#   powershell -ExecutionPolicy Bypass -File .\fix-core-tag-syntax-basic-specification-dependency.ps1
#
# Then from repo root:
#   pnpm i
#   pnpm --filter "@monorepo/core-tag-syntax-basic" build
#   pnpm --filter "@monorepo/core-tag-syntax-basic" test

param(
    [string] $ModuleRoot = "C:\Users\danha\source\repos\HTML\MonoRepro\packages\core-pdf-modules\core-tag-syntax-basic"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Assert-FileExists {
    param([string] $Path)

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        throw "File not found: $Path"
    }
}

function Set-Utf8NoBomFile {
    param(
        [string] $Path,
        [string] $Content
    )

    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

function Ensure-JsonObjectProperty {
    param(
        [pscustomobject] $Object,
        [string] $PropertyName
    )

    if ($null -eq $Object.PSObject.Properties[$PropertyName]) {
        $Object | Add-Member -MemberType NoteProperty -Name $PropertyName -Value ([pscustomobject]@{})
    }
}

function Ensure-Dependency {
    param(
        [pscustomobject] $Dependencies,
        [string] $Name,
        [string] $Version
    )

    $property = $Dependencies.PSObject.Properties[$Name]

    if ($null -eq $property) {
        $Dependencies | Add-Member -MemberType NoteProperty -Name $Name -Value $Version
        return
    }

    $property.Value = $Version
}

$packageJsonFile = Join-Path $ModuleRoot "package.json"
$basicTagSystemSpecificationFile = Join-Path $ModuleRoot "src\specifications\BasicTagSystemSpecification.ts"

Assert-FileExists $packageJsonFile
Assert-FileExists $basicTagSystemSpecificationFile

$packageJson = Get-Content -LiteralPath $packageJsonFile -Raw | ConvertFrom-Json

Ensure-JsonObjectProperty -Object $packageJson -PropertyName "dependencies"

Ensure-Dependency `
    -Dependencies $packageJson.dependencies `
    -Name "@monorepo/core-specifications" `
    -Version "workspace:*"

Ensure-Dependency `
    -Dependencies $packageJson.dependencies `
    -Name "@monorepo/core-tag-syntax-abstract" `
    -Version "workspace:*"

Set-Utf8NoBomFile `
    -Path $packageJsonFile `
    -Content (($packageJson | ConvertTo-Json -Depth 64) + [Environment]::NewLine)

Set-Utf8NoBomFile -Path $basicTagSystemSpecificationFile -Content @'
import { Specification } from "@monorepo/core-specifications";
import { BasicTagSyntaxRegistryFactory } from "../syntax/BasicTagSyntaxRegistryFactory.js";

export class BasicTagSystemSpecification extends Specification<string> {
  private readonly registry = new BasicTagSyntaxRegistryFactory().create();

  public constructor(private readonly expectedSystem: string) {
    super();

    if (expectedSystem.trim().length === 0) {
      throw new Error("expectedSystem must not be empty.");
    }
  }

  public override isSatisfiedBy(candidate: string): boolean {
    const result = this.registry.findFirst(candidate);

    if (result === null || !result.matched) {
      return false;
    }

    return result.match.groups.system === this.expectedSystem;
  }
}
'@

Write-Host "Fixed dependency and BasicTagSystemSpecification:"
Write-Host "  $packageJsonFile"
Write-Host "  $basicTagSystemSpecificationFile"
Write-Host ""
Write-Host "Run from repo root:"
Write-Host "  pnpm i"
Write-Host "  pnpm --filter `"@monorepo/core-tag-syntax-basic`" build"
Write-Host "  pnpm --filter `"@monorepo/core-tag-syntax-basic`" test"