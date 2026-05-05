# FILE: update-web-audio-code.ps1

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$src = Join-Path $root "src"

if (-not (Test-Path $src)) {
    throw "src folder not found: $src"
}

@"
export interface IAudioInput {
  readonly input: AudioNode;
}
"@ | Set-Content -Path (Join-Path $src "IAudioInput.ts") -Encoding UTF8

@"
export interface IAudioOutput {
  connect(input: AudioNode): void;
  disconnect(): void;
}
"@ | Set-Content -Path (Join-Path $src "IAudioOutput.ts") -Encoding UTF8

@"
import type { IAudioInput } from './IAudioInput';
import type { IAudioOutput } from './IAudioOutput';

export interface IAudioUnit extends IAudioInput, IAudioOutput {}
"@ | Set-Content -Path (Join-Path $src "IAudioUnit.ts") -Encoding UTF8

(Get-Content (Join-Path $src "AudioGraphBuilder.ts") -Raw) `
  -replace 'import \{ IAudioOutput \} from "\./main";', "import type { IAudioOutput } from './IAudioOutput';" `
  | Set-Content (Join-Path $src "AudioGraphBuilder.ts") -Encoding UTF8

(Get-Content (Join-Path $src "BuiltAudioGraph.ts") -Raw) `
  -replace 'import type \{ IAudioOutput \} from "\./main";', "import type { IAudioOutput } from './IAudioOutput';" `
  | Set-Content (Join-Path $src "BuiltAudioGraph.ts") -Encoding UTF8

(Get-Content (Join-Path $src "OscillatorSource.ts") -Raw) `
  -replace 'import type \{ IAudioOutput \} from "\./main";', "import type { IAudioOutput } from './IAudioOutput';" `
  | Set-Content (Join-Path $src "OscillatorSource.ts") -Encoding UTF8

@"
import './index.css';
import './AudioPlayerElement';
"@ | Set-Content -Path (Join-Path $src "main.ts") -Encoding UTF8

Write-Host "Web Audio imports fixed."