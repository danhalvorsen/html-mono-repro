[CmdletBinding()]
param(
  [Parameter(Position = 0)]
  [string]$ProjectName = "demo1",

  [Parameter()]
  [string]$ConfigPath = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($ConfigPath)) {
  $scriptDir = $PSScriptRoot

  if ([string]::IsNullOrWhiteSpace($scriptDir)) {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
  }

  $ConfigPath = Join-Path (Split-Path -Parent $scriptDir) "watcher.config.json"
}

function Require-Path {
  param(
    [Parameter(Mandatory = $true)]
    [string]$PathValue,

    [Parameter(Mandatory = $true)]
    [string]$Label
  )

  if ([string]::IsNullOrWhiteSpace($PathValue)) {
    throw "$Label is missing or empty."
  }
}

if (-not (Test-Path -LiteralPath $ConfigPath)) {
  throw "Config file not found: $ConfigPath"
}

$configRaw = Get-Content -LiteralPath $ConfigPath -Raw
$config = $configRaw | ConvertFrom-Json

Require-Path -PathValue $config.gitPath -Label "watcher.config.json: gitPath"

$configuredGitPath = [string]$config.gitPath
$configuredGitPathNormalized = [System.IO.Path]::GetFullPath($configuredGitPath)
$configuredLeaf = [System.IO.Path]::GetFileName($configuredGitPathNormalized)

if ($configuredLeaf -ne ".git") {
  throw "Configured gitPath must end with '.git'. Current value: $configuredGitPathNormalized"
}

$configuredProjectDir = [System.IO.Path]::GetDirectoryName($configuredGitPathNormalized)
Require-Path -PathValue $configuredProjectDir -Label "Configured project directory"

$projectsRootDir = [System.IO.Path]::GetDirectoryName($configuredProjectDir)
Require-Path -PathValue $projectsRootDir -Label "Projects root directory"

$targetProjectDir = Join-Path $projectsRootDir $ProjectName
$targetGitDir = Join-Path $targetProjectDir ".git"

if (-not (Test-Path -LiteralPath $targetProjectDir)) {
  New-Item -Path $targetProjectDir -ItemType Directory -Force | Out-Null
}

if (Test-Path -LiteralPath $targetGitDir) {
  Remove-Item -LiteralPath $targetGitDir -Recurse -Force
}

Push-Location $targetProjectDir
try {
  git init | Out-Null
}
finally {
  Pop-Location
}

Write-Host "Demo git project ready."
Write-Host "Project: $targetProjectDir"
Write-Host "Git dir: $targetGitDir"
