# code.fix.ps1

[CmdletBinding()]
param(
    [switch]$Apply
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$currentPath = (Get-Location).Path
$currentLeaf = Split-Path -Leaf $currentPath

if ($currentLeaf -eq "music-core-synthesizer-voice-playwrigth") {
    $modulePath = $currentPath
} else {
    $modulePath = Join-Path $currentPath "music-core-synthesizer-voice-playwrigth"
}

$filePath = Join-Path $modulePath "tests\support\AudioPlaybackTestDefaults.ts"

if (-not (Test-Path -LiteralPath $filePath)) {
    throw "Missing file: $filePath"
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

$backupRoot = Join-Path $modulePath (".backup\fix-audio-playback-defaults-type-" + (Get-Date -Format "yyyyMMdd-HHmmss"))
New-Item -ItemType Directory -Path $backupRoot | Out-Null

Copy-Item `
    -LiteralPath $filePath `
    -Destination (Join-Path $backupRoot "AudioPlaybackTestDefaults.ts") `
    -Force

$encoding = [System.Text.UTF8Encoding]::new($false)
[System.IO.File]::WriteAllText(
    $filePath,
    $content.TrimEnd() + [Environment]::NewLine,
    $encoding
)

Write-Host "DONE"