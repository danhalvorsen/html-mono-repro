# code.fix.ps1
#
# Purpose:
#   Transform the two fast state-only tests into audible browser audio tests.
#
# Run from:
#   packages\Audio\project-x-ray-sound-magic\music-core-synthesizer\modules
#
# Dry-run:
#   .\code.fix.ps1
#
# Apply:
#   .\code.fix.ps1 -Apply

[CmdletBinding()]
param(
    [switch]$Apply
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$modulesRoot = (Get-Location).Path
$modulePath = Join-Path $modulesRoot "music-core-synthesizer-voice-playwrigth"

if (-not (Test-Path -LiteralPath $modulePath)) {
    throw "Run from the modules folder. Missing: $modulePath"
}

$backupRoot = Join-Path $modulePath (".backup\transform-state-tests-to-audible-" + (Get-Date -Format "yyyyMMdd-HHmmss"))

function New-DirectoryIfMissing {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (Test-Path -LiteralPath $Path) {
        return
    }

    Write-Host "CREATE DIR: $Path"

    if ($Apply) {
        New-Item -ItemType Directory -Path $Path | Out-Null
    }
}

function Backup-File {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        return
    }

    New-DirectoryIfMissing -Path $backupRoot

    $relative = $Path.Substring($modulePath.Length).TrimStart("\", "/")
    $safeName = $relative -replace "[:\\\/]", "_"
    $backupPath = Join-Path $backupRoot $safeName

    Write-Host "BACKUP: $Path -> $backupPath"

    if ($Apply) {
        Copy-Item -LiteralPath $Path -Destination $backupPath -Force
    }
}

function Write-Utf8NoBomFile {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Content
    )

    New-DirectoryIfMissing -Path (Split-Path -Parent $Path)
    Backup-File -Path $Path

    Write-Host "WRITE: $Path"

    if (-not $Apply) {
        return
    }

    $encoding = [System.Text.UTF8Encoding]::new($false)
    [System.IO.File]::WriteAllText(
        $Path,
        $Content.TrimEnd() + [Environment]::NewLine,
        $encoding
    )
}

function Set-JsonProperty {
    param(
        [Parameter(Mandatory = $true)][object]$Object,
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$Value
    )

    if ($null -eq $Object.PSObject.Properties[$Name]) {
        $Object | Add-Member -MemberType NoteProperty -Name $Name -Value $Value
        return
    }

    $Object.PSObject.Properties[$Name].Value = $Value
}

function Update-PackageScripts {
    $packagePath = Join-Path $modulePath "package.json"

    if (-not (Test-Path -LiteralPath $packagePath)) {
        throw "Missing package.json: $packagePath"
    }

    Backup-File -Path $packagePath
    Write-Host "UPDATE JSON: $packagePath"

    if (-not $Apply) {
        return
    }

    $packageJson = Get-Content -LiteralPath $packagePath -Raw | ConvertFrom-Json

    if ($null -eq $packageJson.PSObject.Properties["scripts"]) {
        $packageJson | Add-Member -MemberType NoteProperty -Name "scripts" -Value ([PSCustomObject]@{})
    }

    Set-JsonProperty `
        -Object $packageJson.scripts `
        -Name "test" `
        -Value "playwright test --config playwright.config.ts --headed"

    Set-JsonProperty `
        -Object $packageJson.scripts `
        -Name "test:ci" `
        -Value "playwright test --config playwright.config.ts"

    Set-JsonProperty `
        -Object $packageJson.scripts `
        -Name "test:audible" `
        -Value "playwright test --config playwright.config.ts --headed tests/integration/voice.browser.integration.spec.ts tests/integration/two-voices-two-oscillators.browser.integration.spec.ts"

    Set-JsonProperty `
        -Object $packageJson.scripts `
        -Name "dev:browser" `
        -Value "vite --config tests/browser/vite.config.ts --host 127.0.0.1 --port 4187"

    $encoding = [System.Text.UTF8Encoding]::new($false)
    [System.IO.File]::WriteAllText(
        $packagePath,
        ($packageJson | ConvertTo-Json -Depth 64) + [Environment]::NewLine,
        $encoding
    )
}

function Resolve-TwoVoicesSpecPath {
    $integrationPath = Join-Path $modulePath "tests\integration"

    $matches = @(
        Get-ChildItem `
            -LiteralPath $integrationPath `
            -File `
            -Filter "*.ts" |
        Where-Object {
            $_.Name -like "*two*voices*oscillators*"
        }
    )

    if ($matches.Length -gt 0) {
        return $matches[0].FullName
    }

    return Join-Path $integrationPath "two-voices-two-oscillators.browser.integration.spec.ts"
}
$audibleVoicePlayer = @'
export const AudibleAudioDefaults = {
  DurationMilliseconds: 5_000,
  OutputGain: 0.22,
  PerOscillatorGain: 0.14,
} as const;

export const AudibleVoiceState = {
  NotCreated: "not-created",
  Idle: "idle",
  Active: "active",
  Released: "released",
  Playing: "playing",
  Stopped: "stopped",
} as const;

export type AudibleVoiceStateValue =
  (typeof AudibleVoiceState)[keyof typeof AudibleVoiceState];

export interface IAudibleOscillatorDefinition {
  readonly id: string;
  readonly frequencyHz: number;
  readonly gain: number;
}

export interface IAudibleVoiceDefinition {
  readonly id: string;
  readonly outputGain: number;
  readonly oscillators: readonly IAudibleOscillatorDefinition[];
}

export interface IAudibleVoicePlayRequest {
  readonly voices: readonly IAudibleVoiceDefinition[];
  readonly durationMilliseconds: number;
}

export interface IAudibleVoicePlayResult {
  readonly elapsedMilliseconds: number;
}

export interface IAudibleVoicePlayer {
  play(request: IAudibleVoicePlayRequest): Promise<IAudibleVoicePlayResult>;
}

export class BrowserAudibleVoicePlayer implements IAudibleVoicePlayer {
  public constructor(
    private readonly performanceClock: Performance,
  ) {}

  public async play(
    request: IAudibleVoicePlayRequest,
  ): Promise<IAudibleVoicePlayResult> {
    this.assertRequest(request);

    const AudioContextConstructor = this.resolveAudioContextConstructor();
    const audioContext = new AudioContextConstructor();

    await audioContext.resume();

    return new Promise<IAudibleVoicePlayResult>((resolve, reject) => {
      const nodes: AudioNode[] = [];

      try {
        const startedAtMilliseconds = this.performanceClock.now();
        const startTimeSeconds = audioContext.currentTime;
        const stopTimeSeconds =
          startTimeSeconds + request.durationMilliseconds / 1_000;

        let remainingOscillators = this.countOscillators(request.voices);

        for (const voice of request.voices) {
          const voiceGain = audioContext.createGain();

          voiceGain.gain.setValueAtTime(
            voice.outputGain,
            startTimeSeconds,
          );

          voiceGain.connect(audioContext.destination);
          nodes.push(voiceGain);

          for (const oscillatorDefinition of voice.oscillators) {
            const oscillator = audioContext.createOscillator();
            const oscillatorGain = audioContext.createGain();

            oscillator.type = "sine";

            oscillator.frequency.setValueAtTime(
              oscillatorDefinition.frequencyHz,
              startTimeSeconds,
            );

            oscillatorGain.gain.setValueAtTime(
              oscillatorDefinition.gain,
              startTimeSeconds,
            );

            oscillator.connect(oscillatorGain);
            oscillatorGain.connect(voiceGain);

            nodes.push(oscillator, oscillatorGain);

            oscillator.onended = () => {
              remainingOscillators -= 1;

              if (remainingOscillators > 0) {
                return;
              }

              for (const node of nodes) {
                node.disconnect();
              }

              const elapsedMilliseconds = Math.round(
                this.performanceClock.now() - startedAtMilliseconds,
              );

              void audioContext.close();

              resolve({ elapsedMilliseconds });
            };

            oscillator.start(startTimeSeconds);
            oscillator.stop(stopTimeSeconds);
          }
        }
      } catch (error) {
        for (const node of nodes) {
          node.disconnect();
        }

        void audioContext.close();

        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  private assertRequest(request: IAudibleVoicePlayRequest): void {
    if (request.voices.length === 0) {
      throw new Error("At least one audible voice is required.");
    }

    if (!Number.isFinite(request.durationMilliseconds) || request.durationMilliseconds <= 0) {
      throw new Error(
        `durationMilliseconds must be finite and > 0. Actual value: ${String(request.durationMilliseconds)}.`,
      );
    }

    for (const voice of request.voices) {
      if (voice.oscillators.length === 0) {
        throw new Error(`Voice '${voice.id}' must contain at least one oscillator.`);
      }
    }
  }

  private countOscillators(
    voices: readonly IAudibleVoiceDefinition[],
  ): number {
    return voices.reduce(
      (total, voice) => total + voice.oscillators.length,
      0,
    );
  }

  private resolveAudioContextConstructor(): typeof AudioContext {
    if (globalThis.AudioContext === undefined) {
      throw new Error("AudioContext is not available.");
    }

    return globalThis.AudioContext;
  }
}

export class AudibleDurationResolver {
  public static resolveMilliseconds(): number {
    const rawValue = new URLSearchParams(globalThis.location.search).get("durationMs");

    if (rawValue === null || rawValue.trim().length === 0) {
      return AudibleAudioDefaults.DurationMilliseconds;
    }

    const parsedValue = Number(rawValue);

    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      throw new Error(`durationMs must be finite and > 0. Actual value: ${rawValue}.`);
    }

    return Math.round(parsedValue);
  }
}
'@

$audibleVoiceStateHtml = @'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Audible Voice State Test</title>
  </head>
  <body>
    <main>
      <button id="create-voice" type="button">Create Voice</button>
      <button id="play-voice" type="button">Play Audible Voice</button>
      <button id="reset" type="button">Reset</button>

      <output id="voice-state" aria-live="polite">not-created</output>
      <output id="voice-frequency" aria-live="polite">none</output>
      <output id="voice-velocity" aria-live="polite">0</output>
      <output id="voice-duration-ms" aria-live="polite">0</output>
      <output id="voice-elapsed-ms" aria-live="polite">0</output>
      <output id="voice-error" aria-live="polite"></output>
    </main>

    <script type="module" src="./audible-voice-state-harness.ts"></script>
  </body>
</html>
'@

$audibleVoiceStateHarness = @'
import {
  AudibleAudioDefaults,
  AudibleDurationResolver,
  AudibleVoiceState,
  BrowserAudibleVoicePlayer,
  type IAudibleVoiceDefinition,
  type AudibleVoiceStateValue,
} from "./support/BrowserAudibleVoicePlayer.js";
import { BrowserElementResolver } from "./support/BrowserElementResolver.js";

const BrowserElementId = {
  CreateVoice: "create-voice",
  PlayVoice: "play-voice",
  Reset: "reset",
  VoiceState: "voice-state",
  VoiceFrequency: "voice-frequency",
  VoiceVelocity: "voice-velocity",
  VoiceDurationMilliseconds: "voice-duration-ms",
  VoiceElapsedMilliseconds: "voice-elapsed-ms",
  VoiceError: "voice-error",
} as const;

class AudibleVoiceStateCompositionRoot {
  public compose(): AudibleVoiceStateApplication {
    return new AudibleVoiceStateApplication(
      BrowserElementResolver.getRequiredElement<HTMLButtonElement>(
        BrowserElementId.CreateVoice,
      ),
      BrowserElementResolver.getRequiredElement<HTMLButtonElement>(
        BrowserElementId.PlayVoice,
      ),
      BrowserElementResolver.getRequiredElement<HTMLButtonElement>(
        BrowserElementId.Reset,
      ),
      new AudibleVoiceStatePresenter(
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.VoiceState,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.VoiceFrequency,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.VoiceVelocity,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.VoiceDurationMilliseconds,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.VoiceElapsedMilliseconds,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.VoiceError,
        ),
      ),
      new BrowserAudibleVoicePlayer(performance),
      DefaultAudibleVoiceDefinitionFactory.createSingleOscillatorVoice(),
      AudibleDurationResolver.resolveMilliseconds(),
    );
  }
}

class AudibleVoiceStateApplication {
  private isCreated = false;
  private isPlaying = false;

  public constructor(
    private readonly createVoiceButton: HTMLButtonElement,
    private readonly playVoiceButton: HTMLButtonElement,
    private readonly resetButton: HTMLButtonElement,
    private readonly presenter: IAudibleVoiceStatePresenter,
    private readonly player: BrowserAudibleVoicePlayer,
    private readonly voice: IAudibleVoiceDefinition,
    private readonly durationMilliseconds: number,
  ) {}

  public start(): void {
    this.presenter.presentState(AudibleVoiceState.NotCreated);
    this.presenter.presentFrequency(null);
    this.presenter.presentVelocity(0);
    this.presenter.presentDurationMilliseconds(this.durationMilliseconds);
    this.presenter.presentElapsedMilliseconds(0);
    this.presenter.presentError(null);

    this.createVoiceButton.addEventListener("click", this.onCreateVoiceClicked);
    this.playVoiceButton.addEventListener("click", this.onPlayVoiceClicked);
    this.resetButton.addEventListener("click", this.onResetClicked);
  }

  private readonly onCreateVoiceClicked = (): void => {
    this.isCreated = true;
    this.presenter.presentState(AudibleVoiceState.Idle);
    this.presenter.presentFrequency(null);
    this.presenter.presentVelocity(0);
    this.presenter.presentElapsedMilliseconds(0);
    this.presenter.presentError(null);
  };

  private readonly onPlayVoiceClicked = (): void => {
    void this.playVoice();
  };

  private readonly onResetClicked = (): void => {
    if (this.isPlaying) {
      return;
    }

    this.isCreated = false;
    this.presenter.presentState(AudibleVoiceState.NotCreated);
    this.presenter.presentFrequency(null);
    this.presenter.presentVelocity(0);
    this.presenter.presentElapsedMilliseconds(0);
    this.presenter.presentError(null);
  };

  private async playVoice(): Promise<void> {
    if (!this.isCreated || this.isPlaying) {
      return;
    }

    this.isPlaying = true;
    this.presenter.presentState(AudibleVoiceState.Active);
    this.presenter.presentFrequency(this.voice.oscillators[0]?.frequencyHz ?? null);
    this.presenter.presentVelocity(0.75);
    this.presenter.presentElapsedMilliseconds(0);
    this.presenter.presentError(null);

    try {
      const result = await this.player.play({
        voices: [this.voice],
        durationMilliseconds: this.durationMilliseconds,
      });

      this.presenter.presentElapsedMilliseconds(result.elapsedMilliseconds);
      this.presenter.presentState(AudibleVoiceState.Released);
      this.presenter.presentVelocity(0);
    } catch (error) {
      this.presenter.presentState(AudibleVoiceState.Released);
      this.presenter.presentVelocity(0);
      this.presenter.presentError(error instanceof Error ? error.message : String(error));
    } finally {
      this.isPlaying = false;
    }
  }
}

interface IAudibleVoiceStatePresenter {
  presentState(state: AudibleVoiceStateValue): void;
  presentFrequency(frequencyHz: number | null): void;
  presentVelocity(velocity: number): void;
  presentDurationMilliseconds(durationMilliseconds: number): void;
  presentElapsedMilliseconds(elapsedMilliseconds: number): void;
  presentError(error: string | null): void;
}

class AudibleVoiceStatePresenter implements IAudibleVoiceStatePresenter {
  public constructor(
    private readonly stateOutput: HTMLOutputElement,
    private readonly frequencyOutput: HTMLOutputElement,
    private readonly velocityOutput: HTMLOutputElement,
    private readonly durationOutput: HTMLOutputElement,
    private readonly elapsedOutput: HTMLOutputElement,
    private readonly errorOutput: HTMLOutputElement,
  ) {}

  public presentState(state: AudibleVoiceStateValue): void {
    this.stateOutput.value = state;
  }

  public presentFrequency(frequencyHz: number | null): void {
    this.frequencyOutput.value = frequencyHz === null ? "none" : String(frequencyHz);
  }

  public presentVelocity(velocity: number): void {
    this.velocityOutput.value = String(velocity);
  }

  public presentDurationMilliseconds(durationMilliseconds: number): void {
    this.durationOutput.value = String(durationMilliseconds);
  }

  public presentElapsedMilliseconds(elapsedMilliseconds: number): void {
    this.elapsedOutput.value = String(elapsedMilliseconds);
  }

  public presentError(error: string | null): void {
    this.errorOutput.value = error ?? "";
  }
}

class DefaultAudibleVoiceDefinitionFactory {
  public static createSingleOscillatorVoice(): IAudibleVoiceDefinition {
    return {
      id: "audible-single-voice",
      outputGain: AudibleAudioDefaults.OutputGain,
      oscillators: [
        {
          id: "osc-v1",
          frequencyHz: 440,
          gain: AudibleAudioDefaults.PerOscillatorGain,
        },
      ],
    };
  }
}

new AudibleVoiceStateCompositionRoot().compose().start();
'@

$audibleTwoVoicesHtml = @'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Audible Two Voices Two Oscillators</title>
  </head>
  <body>
    <main>
      <button id="play-two-voices" type="button">Play Two Voices</button>

      <output id="voice-state" aria-live="polite">idle</output>
      <output id="voice-count" aria-live="polite">0</output>
      <output id="voice-1-oscillators" aria-live="polite"></output>
      <output id="voice-2-oscillators" aria-live="polite"></output>
      <output id="voice-frequencies" aria-live="polite"></output>
      <output id="voice-duration-ms" aria-live="polite">0</output>
      <output id="voice-elapsed-ms" aria-live="polite">0</output>
      <output id="voice-error" aria-live="polite"></output>
    </main>

    <script type="module" src="./audible-two-voices-two-oscillators-harness.ts"></script>
  </body>
</html>
'@

$audibleTwoVoicesHarness = @'
import {
  AudibleAudioDefaults,
  AudibleDurationResolver,
  AudibleVoiceState,
  BrowserAudibleVoicePlayer,
  type IAudibleVoiceDefinition,
  type AudibleVoiceStateValue,
} from "./support/BrowserAudibleVoicePlayer.js";
import { BrowserElementResolver } from "./support/BrowserElementResolver.js";

const BrowserElementId = {
  PlayTwoVoices: "play-two-voices",
  VoiceState: "voice-state",
  VoiceCount: "voice-count",
  Voice1Oscillators: "voice-1-oscillators",
  Voice2Oscillators: "voice-2-oscillators",
  VoiceFrequencies: "voice-frequencies",
  VoiceDurationMilliseconds: "voice-duration-ms",
  VoiceElapsedMilliseconds: "voice-elapsed-ms",
  VoiceError: "voice-error",
} as const;

class AudibleTwoVoicesCompositionRoot {
  public compose(): AudibleTwoVoicesApplication {
    return new AudibleTwoVoicesApplication(
      BrowserElementResolver.getRequiredElement<HTMLButtonElement>(
        BrowserElementId.PlayTwoVoices,
      ),
      new AudibleTwoVoicesPresenter(
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.VoiceState,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.VoiceCount,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.Voice1Oscillators,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.Voice2Oscillators,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.VoiceFrequencies,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.VoiceDurationMilliseconds,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.VoiceElapsedMilliseconds,
        ),
        BrowserElementResolver.getRequiredElement<HTMLOutputElement>(
          BrowserElementId.VoiceError,
        ),
      ),
      new BrowserAudibleVoicePlayer(performance),
      DefaultTwoAudibleVoicesFactory.create(),
      AudibleDurationResolver.resolveMilliseconds(),
    );
  }
}

class AudibleTwoVoicesApplication {
  private isPlaying = false;

  public constructor(
    private readonly playButton: HTMLButtonElement,
    private readonly presenter: IAudibleTwoVoicesPresenter,
    private readonly player: BrowserAudibleVoicePlayer,
    private readonly voices: readonly IAudibleVoiceDefinition[],
    private readonly durationMilliseconds: number,
  ) {}

  public start(): void {
    this.presenter.presentDefinition(this.voices);
    this.presenter.presentDurationMilliseconds(this.durationMilliseconds);
    this.presenter.presentState(AudibleVoiceState.Idle);
    this.presenter.presentElapsedMilliseconds(0);
    this.presenter.presentError(null);

    this.playButton.addEventListener("click", this.onPlayClicked);
  }

  private readonly onPlayClicked = (): void => {
    void this.play();
  };

  private async play(): Promise<void> {
    if (this.isPlaying) {
      return;
    }

    this.isPlaying = true;
    this.presenter.presentState(AudibleVoiceState.Playing);
    this.presenter.presentElapsedMilliseconds(0);
    this.presenter.presentError(null);

    try {
      const result = await this.player.play({
        voices: this.voices,
        durationMilliseconds: this.durationMilliseconds,
      });

      this.presenter.presentElapsedMilliseconds(result.elapsedMilliseconds);
      this.presenter.presentState(AudibleVoiceState.Stopped);
    } catch (error) {
      this.presenter.presentState(AudibleVoiceState.Stopped);
      this.presenter.presentError(error instanceof Error ? error.message : String(error));
    } finally {
      this.isPlaying = false;
    }
  }
}

interface IAudibleTwoVoicesPresenter {
  presentDefinition(voices: readonly IAudibleVoiceDefinition[]): void;
  presentState(state: AudibleVoiceStateValue): void;
  presentDurationMilliseconds(durationMilliseconds: number): void;
  presentElapsedMilliseconds(elapsedMilliseconds: number): void;
  presentError(error: string | null): void;
}

class AudibleTwoVoicesPresenter implements IAudibleTwoVoicesPresenter {
  public constructor(
    private readonly stateOutput: HTMLOutputElement,
    private readonly voiceCountOutput: HTMLOutputElement,
    private readonly voice1OscillatorsOutput: HTMLOutputElement,
    private readonly voice2OscillatorsOutput: HTMLOutputElement,
    private readonly frequenciesOutput: HTMLOutputElement,
    private readonly durationOutput: HTMLOutputElement,
    private readonly elapsedOutput: HTMLOutputElement,
    private readonly errorOutput: HTMLOutputElement,
  ) {}

  public presentDefinition(voices: readonly IAudibleVoiceDefinition[]): void {
    const voice1 = voices.find((voice) => voice.id === "voice-1");
    const voice2 = voices.find((voice) => voice.id === "voice-2");

    this.voiceCountOutput.value = String(voices.length);
    this.voice1OscillatorsOutput.value = this.renderOscillatorIds(voice1);
    this.voice2OscillatorsOutput.value = this.renderOscillatorIds(voice2);
    this.frequenciesOutput.value = voices
      .flatMap((voice) => voice.oscillators)
      .map((oscillator) => String(oscillator.frequencyHz))
      .join(",");
  }

  public presentState(state: AudibleVoiceStateValue): void {
    this.stateOutput.value = state;
  }

  public presentDurationMilliseconds(durationMilliseconds: number): void {
    this.durationOutput.value = String(durationMilliseconds);
  }

  public presentElapsedMilliseconds(elapsedMilliseconds: number): void {
    this.elapsedOutput.value = String(elapsedMilliseconds);
  }

  public presentError(error: string | null): void {
    this.errorOutput.value = error ?? "";
  }

  private renderOscillatorIds(
    voice: IAudibleVoiceDefinition | undefined,
  ): string {
    if (voice === undefined) {
      return "";
    }

    return voice.oscillators
      .map((oscillator) => oscillator.id)
      .join(",");
  }
}

class DefaultTwoAudibleVoicesFactory {
  public static create(): readonly IAudibleVoiceDefinition[] {
    return [
      {
        id: "voice-1",
        outputGain: AudibleAudioDefaults.OutputGain,
        oscillators: [
          {
            id: "osc-v1-a",
            frequencyHz: 261.63,
            gain: AudibleAudioDefaults.PerOscillatorGain,
          },
          {
            id: "osc-v1-b",
            frequencyHz: 329.63,
            gain: AudibleAudioDefaults.PerOscillatorGain,
          },
        ],
      },
      {
        id: "voice-2",
        outputGain: AudibleAudioDefaults.OutputGain,
        oscillators: [
          {
            id: "osc-v2-a",
            frequencyHz: 392,
            gain: AudibleAudioDefaults.PerOscillatorGain,
          },
          {
            id: "osc-v2-b",
            frequencyHz: 523.25,
            gain: AudibleAudioDefaults.PerOscillatorGain,
          },
        ],
      },
    ];
  }
}

new AudibleTwoVoicesCompositionRoot().compose().start();
'@

$audibleVoiceStatePage = @'
import { expect, type Locator, type Page } from "@playwright/test";

const AudibleVoiceStateRoute = {
  Default: "/audible-voice-state.html?durationMs=5000",
} as const;

const AudibleVoiceStateSelector = {
  CreateVoice: "#create-voice",
  PlayVoice: "#play-voice",
  Reset: "#reset",
  State: "#voice-state",
  Frequency: "#voice-frequency",
  Velocity: "#voice-velocity",
  DurationMilliseconds: "#voice-duration-ms",
  ElapsedMilliseconds: "#voice-elapsed-ms",
  Error: "#voice-error",
} as const;

export class AudibleVoiceStatePage {
  public constructor(
    private readonly page: Page,
  ) {}

  public get state(): Locator {
    return this.page.locator(AudibleVoiceStateSelector.State);
  }

  public get frequency(): Locator {
    return this.page.locator(AudibleVoiceStateSelector.Frequency);
  }

  public get velocity(): Locator {
    return this.page.locator(AudibleVoiceStateSelector.Velocity);
  }

  public get elapsedMilliseconds(): Locator {
    return this.page.locator(AudibleVoiceStateSelector.ElapsedMilliseconds);
  }

  public get error(): Locator {
    return this.page.locator(AudibleVoiceStateSelector.Error);
  }

  public async open(): Promise<void> {
    await this.page.goto(AudibleVoiceStateRoute.Default);
  }

  public async shouldBeNotCreated(): Promise<void> {
    await expect(this.state).toHaveText("not-created");
    await expect(this.frequency).toHaveText("none");
    await expect(this.velocity).toHaveText("0");
    await expect(this.error).toHaveText("");
  }

  public async createVoice(): Promise<void> {
    await this.page.locator(AudibleVoiceStateSelector.CreateVoice).click();
  }

  public async playVoice(): Promise<void> {
    await this.page.locator(AudibleVoiceStateSelector.PlayVoice).click();
  }

  public async reset(): Promise<void> {
    await this.page.locator(AudibleVoiceStateSelector.Reset).click();
  }

  public async shouldBeIdle(): Promise<void> {
    await expect(this.state).toHaveText("idle");
    await expect(this.frequency).toHaveText("none");
    await expect(this.velocity).toHaveText("0");
  }

  public async shouldBeActive(): Promise<void> {
    await expect(this.state).toHaveText("active");
    await expect(this.frequency).toHaveText("440");
    await expect(this.velocity).toHaveText("0.75");
  }

  public async shouldBeReleasedAfterAudiblePlayback(): Promise<void> {
    await expect(this.state).toHaveText("released", {
      timeout: 8_000,
    });

    await expect(this.velocity).toHaveText("0");

    const elapsedText = await this.elapsedMilliseconds.textContent();
    const elapsedMilliseconds = Number(elapsedText);

    expect(Number.isFinite(elapsedMilliseconds)).toBe(true);
    expect(elapsedMilliseconds).toBeGreaterThanOrEqual(4_500);
    expect(elapsedMilliseconds).toBeLessThanOrEqual(6_000);

    await expect(this.error).toHaveText("");
  }
}
'@

$audibleTwoVoicesPage = @'
import { expect, type Locator, type Page } from "@playwright/test";

const AudibleTwoVoicesRoute = {
  Default: "/audible-two-voices-two-oscillators.html?durationMs=5000",
} as const;

const AudibleTwoVoicesSelector = {
  PlayTwoVoices: "#play-two-voices",
  State: "#voice-state",
  VoiceCount: "#voice-count",
  Voice1Oscillators: "#voice-1-oscillators",
  Voice2Oscillators: "#voice-2-oscillators",
  Frequencies: "#voice-frequencies",
  ElapsedMilliseconds: "#voice-elapsed-ms",
  Error: "#voice-error",
} as const;

export class AudibleTwoVoicesPage {
  public constructor(
    private readonly page: Page,
  ) {}

  public get state(): Locator {
    return this.page.locator(AudibleTwoVoicesSelector.State);
  }

  public get elapsedMilliseconds(): Locator {
    return this.page.locator(AudibleTwoVoicesSelector.ElapsedMilliseconds);
  }

  public async open(): Promise<void> {
    await this.page.goto(AudibleTwoVoicesRoute.Default);
  }

  public async shouldHaveBoundOscillators(): Promise<void> {
    await expect(this.page.locator(AudibleTwoVoicesSelector.State)).toHaveText("idle");
    await expect(this.page.locator(AudibleTwoVoicesSelector.VoiceCount)).toHaveText("2");
    await expect(this.page.locator(AudibleTwoVoicesSelector.Voice1Oscillators)).toHaveText("osc-v1-a,osc-v1-b");
    await expect(this.page.locator(AudibleTwoVoicesSelector.Voice2Oscillators)).toHaveText("osc-v2-a,osc-v2-b");
    await expect(this.page.locator(AudibleTwoVoicesSelector.Frequencies)).toHaveText("261.63,329.63,392,523.25");
    await expect(this.page.locator(AudibleTwoVoicesSelector.Error)).toHaveText("");
  }

  public async play(): Promise<void> {
    await this.page.locator(AudibleTwoVoicesSelector.PlayTwoVoices).click();
    await expect(this.state).toHaveText("playing");
  }

  public async shouldStopAfterAudiblePlayback(): Promise<void> {
    await expect(this.state).toHaveText("stopped", {
      timeout: 8_000,
    });

    const elapsedText = await this.elapsedMilliseconds.textContent();
    const elapsedMilliseconds = Number(elapsedText);

    expect(Number.isFinite(elapsedMilliseconds)).toBe(true);
    expect(elapsedMilliseconds).toBeGreaterThanOrEqual(4_500);
    expect(elapsedMilliseconds).toBeLessThanOrEqual(6_000);

    await expect(this.page.locator(AudibleTwoVoicesSelector.Error)).toHaveText("");
  }
}
'@

$voiceSpec = @'
import { test } from "@playwright/test";

import { AudibleVoiceStatePage } from "../support/AudibleVoiceStatePage.js";

test.describe("Voice browser integration", () => {
  test("should create a voice and play audible sound during the active state", async ({ page }) => {
    const voicePage = new AudibleVoiceStatePage(page);

    await voicePage.open();

    await voicePage.shouldBeNotCreated();

    await voicePage.createVoice();

    await voicePage.shouldBeIdle();

    await voicePage.playVoice();

    await voicePage.shouldBeActive();

    await voicePage.shouldBeReleasedAfterAudiblePlayback();

    await voicePage.reset();

    await voicePage.shouldBeNotCreated();
  });
});
'@

$twoVoicesSpec = @'
import { test } from "@playwright/test";

import { AudibleTwoVoicesPage } from "../support/AudibleTwoVoicesPage.js";

test.describe("two voices with two oscillators each", () => {
  test("keeps osc-v1 and osc-v2 bound to the voice they belong to while playing audible sound", async ({ page }) => {
    const voicePage = new AudibleTwoVoicesPage(page);

    await voicePage.open();

    await voicePage.shouldHaveBoundOscillators();

    await voicePage.play();

    await voicePage.shouldStopAfterAudiblePlayback();
  });
});
'@

Update-PackageScripts

Write-Utf8NoBomFile `
    -Path (Join-Path $modulePath "tests\browser\support\BrowserAudibleVoicePlayer.ts") `
    -Content $audibleVoicePlayer

Write-Utf8NoBomFile `
    -Path (Join-Path $modulePath "tests\browser\audible-voice-state.html") `
    -Content $audibleVoiceStateHtml

Write-Utf8NoBomFile `
    -Path (Join-Path $modulePath "tests\browser\audible-voice-state-harness.ts") `
    -Content $audibleVoiceStateHarness

Write-Utf8NoBomFile `
    -Path (Join-Path $modulePath "tests\browser\audible-two-voices-two-oscillators.html") `
    -Content $audibleTwoVoicesHtml

Write-Utf8NoBomFile `
    -Path (Join-Path $modulePath "tests\browser\audible-two-voices-two-oscillators-harness.ts") `
    -Content $audibleTwoVoicesHarness

Write-Utf8NoBomFile `
    -Path (Join-Path $modulePath "tests\support\AudibleVoiceStatePage.ts") `
    -Content $audibleVoiceStatePage

Write-Utf8NoBomFile `
    -Path (Join-Path $modulePath "tests\support\AudibleTwoVoicesPage.ts") `
    -Content $audibleTwoVoicesPage

Write-Utf8NoBomFile `
    -Path (Join-Path $modulePath "tests\integration\voice.browser.integration.spec.ts") `
    -Content $voiceSpec

Write-Utf8NoBomFile `
    -Path (Resolve-TwoVoicesSpecPath) `
    -Content $twoVoicesSpec

Write-Host ""
Write-Host "DONE"

if (-not $Apply) {
    Write-Host "Dry-run only. Re-run with -Apply."
    exit 0
}

Write-Host ""
Write-Host "Next:"
Write-Host "  pnpm --filter @monorepo/music-core-synthesizer-voice-playwright build"
Write-Host "  pnpm --filter @monorepo/music-core-synthesizer-voice-playwright test:audible"
Write-Host ""
Write-Host "Full headed test run:"
Write-Host "  pnpm --filter @monorepo/music-core-synthesizer-voice-playwright test"
Write-Host ""
Write-Host "Silent CI run:"
Write-Host "  pnpm --filter @monorepo/music-core-synthesizer-voice-playwright test:ci"