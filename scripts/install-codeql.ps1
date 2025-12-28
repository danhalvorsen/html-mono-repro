<#
.SYNOPSIS
  Download and install the CodeQL CLI to %USERPROFILE%\tools\codeql and add it to the user PATH.

.PARAMETER Version
  Optional release tag or "latest" (default). If you pass a specific release tag use the
  GitHub release name, e.g. "v2.12.0".

.EXAMPLE
  .\install-codeql.ps1
  Installs latest CodeQL CLI.

.EXAMPLE
  .\install-codeql.ps1 -Version v2.12.0
  Installs the specified CodeQL release.
#>

param(
  [string]$Version = 'latest'
)

try {
  $zipUrl = if ($Version -eq 'latest') {
    'https://github.com/github/codeql-cli-binaries/releases/latest/download/codeql-win64.zip'
  } else {
    "https://github.com/github/codeql-cli-binaries/releases/download/$Version/codeql-win64.zip"
  }

  $destZip = Join-Path $env:TEMP 'codeql.zip'
  $installDir = Join-Path $env:USERPROFILE 'tools\codeql'

  Write-Host "Downloading CodeQL from: $zipUrl"
  Invoke-WebRequest -Uri $zipUrl -OutFile $destZip -UseBasicParsing

  if (Test-Path $installDir) {
    Write-Host "Existing installation found at $installDir - removing"
    Remove-Item -LiteralPath $installDir -Recurse -Force -ErrorAction Stop
  }

  Write-Host "Extracting to $installDir"
  Expand-Archive -Path $destZip -DestinationPath $installDir -Force

  # Persist to user PATH if not already present
  $oldPath = [Environment]::GetEnvironmentVariable('Path',[EnvironmentVariableTarget]::User)
  if ($oldPath -notlike "*$installDir*") {
    $newPath = if ([string]::IsNullOrEmpty($oldPath)) { $installDir } else { "$oldPath;$installDir" }
    [Environment]::SetEnvironmentVariable('Path', $newPath, [EnvironmentVariableTarget]::User)
    Write-Host "Added $installDir to user PATH"
  } else {
    Write-Host "$installDir already present in user PATH"
  }

  # Make available in current session
  $env:PATH = "$installDir;$env:PATH"

  Write-Host "CodeQL installation complete. Verify with:"
  Write-Host "  codeql --version"
  exit 0
}
catch {
  Write-Error "Installation failed: $_"
  exit 1
}
