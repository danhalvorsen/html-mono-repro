# fix-audio-playback-window-type.ps1
#
# Run from:
#   music-core-synthesizer-voice-playwrigth
#
# Apply:
#   .\fix-audio-playback-window-type.ps1 -Apply

[CmdletBinding()]
param(
    [switch]$Apply
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$modulePath = (Get-Location).Path
$filePath = Join-Path $modulePath "tests\support\AudioPlaybackTestDefaults.ts"

if (-not (Test-Path -LiteralPath $filePath)) {
    throw "Missing file: $filePath"
}

$backupRoot = Join-Path $modulePath (".backup\fix-audio-playback-window-type-" + (Get-Date -Format "yyyyMMdd-HHmmss"))

function Backup-File {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (-not $Apply) {
        return
    }

    if (-not (Test-Path -LiteralPath $backupRoot)) {
        New-Item -ItemType Directory -Path $backupRoot | Out-Null
    }

    Copy-Item `
        -LiteralPath $Path `
        -Destination (Join-Path $backupRoot (Split-Path -Leaf $Path)) `
        -Force
}

$content = @'
export const AudioPlaybackTestDefaults = {
  DurationMilliseconds: 5_000,
  MinimumToleranceMilliseconds: 350,
  MaximumToleranceMilliseconds: 750,
  StopPaddingSeconds: 0.05,
} as const;

export interface IExpectedAudioPlaybackWindow {
  readonly timeoutMilliseconds: number;

  readonly minimumMilliseconds: number;
  readonly maximumMilliseconds: number;

  readonly minimumElapsedMilliseconds: number;
  readonly maximumElapsedMilliseconds: number;
}

export class AudioPlaybackExpectationFactory {
  public static createDefault(): IExpectedAudioPlaybackWindow {
    const minimumMilliseconds =
      AudioPlaybackTestDefaults.DurationMilliseconds
      - AudioPlaybackTestDefaults.MinimumToleranceMilliseconds;

    const maximumMilliseconds =
      AudioPlaybackTestDefaults.DurationMilliseconds
      + AudioPlaybackTestDefaults.MaximumToleranceMilliseconds;

    return {
      timeoutMilliseconds:
        AudioPlaybackTestDefaults.DurationMilliseconds
        + AudioPlaybackTestDefaults.MaximumToleranceMilliseconds
        + 2_000,

      minimumMilliseconds,
      maximumMilliseconds,

      minimumElapsedMilliseconds: minimumMilliseconds,
      maximumElapsedMilliseconds: maximumMilliseconds,
    };
  }
}
'@

Write-Host "WRITE: $filePath"

if (-not $Apply) {
    Write-Host "Dry-run only. Re-run with -Apply."
    exit 0
}

Backup-File -Path $filePath

$encoding = [System.Text.UTF8Encoding]::new($false)
[System.IO.File]::WriteAllText(
    $filePath,
    $content.TrimEnd() + [Environment]::NewLine,
    $encoding
)

Write-Host "DONE"