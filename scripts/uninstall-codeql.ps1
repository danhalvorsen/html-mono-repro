<#
.SYNOPSIS
  Remove CodeQL CLI files and (optionally) remove the installation directory.

.PARAMETER RemoveFiles
  If specified, the installation directory (%USERPROFILE%\tools\codeql) will be deleted.

.EXAMPLE
  .\uninstall-codeql.ps1
  Removes PATH entry but leaves files.

.EXAMPLE
  .\uninstall-codeql.ps1 -RemoveFiles
  Removes PATH entry and deletes the installation folder.
#>

param(
  [switch]$RemoveFiles
)

$installDir = Join-Path $env:USERPROFILE 'tools\codeql'

try {
  $oldPath = [Environment]::GetEnvironmentVariable('Path',[EnvironmentVariableTarget]::User)
  if ($oldPath -like "*$installDir*") {
    $parts = $oldPath -split ';' | Where-Object { $_ -and ($_ -ne $installDir) }
    $newPath = $parts -join ';'
    [Environment]::SetEnvironmentVariable('Path', $newPath, [EnvironmentVariableTarget]::User)
    Write-Host "Removed $installDir from user PATH"
  } else {
    Write-Host "$installDir not present in user PATH"
  }

  if ($RemoveFiles) {
    if (Test-Path $installDir) {
      Remove-Item -LiteralPath $installDir -Recurse -Force -ErrorAction Stop
      Write-Host "Deleted $installDir"
    } else {
      Write-Host "$installDir not found"
    }
  }

  Write-Host "Uninstall complete. You may need to open a new shell to pick up PATH changes."
  exit 0
}
catch {
  Write-Error "Uninstall failed: $_"
  exit 1
}
