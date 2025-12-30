param(
    [string]$RootPath = "$(Split-Path -Parent $MyInvocation.MyCommand.Path)"
)

function Read-PackageJson {
    param([string]$Path)
    $content = Get-Content -Raw -LiteralPath $Path -Encoding UTF8
    if ($content.StartsWith("﻿")) { $content = $content.Substring(1) }
    return $content | ConvertFrom-Json
}

function Get-Suggestions($depName, $workspaceNames) {
    $depLower = $depName.ToLowerInvariant()
    $partialMatches = $workspaceNames | Where-Object { $_.ToLowerInvariant().Contains($depLower) }
    if ($partialMatches.Count -gt 0) {
        return $partialMatches
    }

    $scopeMatches = $workspaceNames | Where-Object { $_.Split('/')[-1].ToLowerInvariant().Contains($depLower.Split('/')[-1]) }
    if ($scopeMatches.Count -gt 0) {
        return $scopeMatches
    }

    return @()
}

$functionalityAdded = $true
function Get-AlternateScope {
    param([string]$Dep)
    $scopes = '@my-graphics', '@monorepo'
    foreach ($scope in $scopes) {
        if ($Dep.StartsWith("$scope/")) {
            $altScope = $scopes | Where-Object { $_ -ne $scope }
            return "$altScope/$($Dep.Split('/')[1])"
        }
    }
    return $null
}

$workspacePackages = [ordered]@{}
Get-ChildItem -Path "$RootPath/packages" -Filter package.json -Recurse -File | ForEach-Object {
    try {
        $pkg = Read-PackageJson -Path $_.FullName
    } catch {
        Write-Warning "Skipping invalid JSON: $($_.FullName)"
        return
    }

    if ($pkg.name) {
        $workspacePackages[$pkg.name] = $_.DirectoryName
    }
}

$missingDeps = @{}
$depKinds = 'dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'

Get-ChildItem -Path "$RootPath/packages" -Filter package.json -Recurse -File | ForEach-Object {
    try {
        $pkg = Read-PackageJson -Path $_.FullName
    } catch {
        return
    }

    $pkgName = $pkg.name
    foreach ($kind in $depKinds) {
        $deps = $pkg.$kind
        if ($null -eq $deps) { continue }

        foreach ($depName in $deps.PSObject.Properties.Name) {
            $specifier = $deps.$depName
            if ($specifier -is [string] -and $specifier.StartsWith('workspace:', [System.StringComparison]::InvariantCultureIgnoreCase)) {
                if (-not $workspacePackages.ContainsKey($depName)) {
                    $missingDeps[$pkgName] = $missingDeps[$pkgName] + @($kind + ': ' + $depName + ' -> ' + $specifier)
                }
            }
        }
    }
}

if ($missingDeps.Count -eq 0) {
    Write-Host 'All workspace references resolve to an existing package.'
    exit 0
}

Write-Host 'Missing workspace packages:' -ForegroundColor Yellow
foreach ($pkg in $missingDeps.Keys) {
    Write-Host "  $pkg" -ForegroundColor Cyan
    $missingDeps[$pkg] | ForEach-Object { Write-Host "    $_" }
    $missingDeps[$pkg] | ForEach-Object {
        $parts = ($_ -split ':\s+')
        if ($parts.Length -lt 2) { return }
        $rest = $parts[1]
        $depName = ($rest -split '\s+->\s+')[0]
        $suggestions = Get-Suggestions $depName $workspacePackages.Keys
        $alternate = Get-AlternateScope $depName
        if ($alternate -and $workspacePackages.ContainsKey($alternate) -and ($suggestions -notcontains $alternate)) {
            $suggestions += $alternate
        }
        if ($suggestions.Count -gt 0) {
            Write-Host "      Suggestions:" ($suggestions -join ', ') -ForegroundColor DarkYellow
        }
    }
}
exit 1
