# FILE: fix-sound-test-melody-and-adsr-ui.ps1

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$ProjectRoot = "C:\Users\danha\source\repos\HTML\MonoRepro\packages\Audio\project-x-ray-sound-magic"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$BackupStamp = Get-Date -Format "yyyyMMdd-HHmmss"

$SampleAppRoot = Join-Path $ProjectRoot "test-playground\modules-basic-tester"
$SoundFeatureRoot = Join-Path $SampleAppRoot "src\features\soundTestFeature"
$EnvelopeUiRoot = Join-Path $ProjectRoot "music-core-synthesizer\modules\music-core-synthesizer-envelopes-ui"
$EnvelopeUiSrc = Join-Path $EnvelopeUiRoot "src"

function Assert-Directory {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (-not (Test-Path -LiteralPath $Path -PathType Container)) {
        throw "Directory not found: $Path"
    }
}

function Backup-File {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (Test-Path -LiteralPath $Path -PathType Leaf) {
        Copy-Item -LiteralPath $Path -Destination "$Path.bak.$BackupStamp" -Force
    }
}

function Write-Utf8File {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Content
    )

    $directory = Split-Path -Parent $Path

    if (-not (Test-Path -LiteralPath $directory -PathType Container)) {
        New-Item -ItemType Directory -Path $directory | Out-Null
    }

    $next = $Content.TrimEnd() + [Environment]::NewLine

    if (Test-Path -LiteralPath $Path -PathType Leaf) {
        $current = Get-Content -LiteralPath $Path -Raw

        if ($current -eq $next) {
            Write-Host "Unchanged: $Path"
            return
        }

        Backup-File -Path $Path
    }

    [System.IO.File]::WriteAllText($Path, $next, $Utf8NoBom)
    Write-Host "Written:   $Path"
}

function Add-ExportIfMissing {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$ExportLine
    )

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        Write-Utf8File -Path $Path -Content $ExportLine
        return
    }

    $content = Get-Content -LiteralPath $Path -Raw

    if ($content.Contains($ExportLine)) {
        Write-Host "Already exported: $ExportLine"
        return
    }

    Backup-File -Path $Path
    Add-Content -LiteralPath $Path -Value $ExportLine
    Write-Host "Patched:   $Path"
}

function Set-JsonProperty {
    param(
        [Parameter(Mandatory = $true)][pscustomobject]$Object,
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][object]$Value
    )

    if ($Object.PSObject.Properties.Name -contains $Name) {
        $Object.$Name = $Value
        return
    }

    Add-Member -InputObject $Object -NotePropertyName $Name -NotePropertyValue $Value
}

function Add-PackageDependency {
    param(
        [Parameter(Mandatory = $true)][string]$PackageJsonPath,
        [Parameter(Mandatory = $true)][string]$DependencyName,
        [Parameter(Mandatory = $true)][string]$Version
    )

    if (-not (Test-Path -LiteralPath $PackageJsonPath -PathType Leaf)) {
        Write-Host "Skipped dependency. package.json not found: $PackageJsonPath"
        return
    }

    $json = Get-Content -LiteralPath $PackageJsonPath -Raw | ConvertFrom-Json

    if ($null -eq $json.dependencies) {
        Set-JsonProperty -Object $json -Name "dependencies" -Value ([pscustomobject]@{})
    }

    Set-JsonProperty -Object $json.dependencies -Name $DependencyName -Value $Version

    Backup-File -Path $PackageJsonPath

    [System.IO.File]::WriteAllText(
        $PackageJsonPath,
        (($json | ConvertTo-Json -Depth 100) + [Environment]::NewLine),
        $Utf8NoBom
    )

    Write-Host "Dependency: $DependencyName -> $Version"
}

function Insert-BeforeFirstImportIfMissing {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Needle,
        [Parameter(Mandatory = $true)][string]$Block
    )

    $content = Get-Content -LiteralPath $Path -Raw

    if ($content.Contains($Needle)) {
        Write-Host "Already patched imports: $Path"
        return
    }

    Backup-File -Path $Path

    [System.IO.File]::WriteAllText(
        $Path,
        ($Block.TrimEnd() + [Environment]::NewLine + [Environment]::NewLine + $content),
        $Utf8NoBom
    )

    Write-Host "Patched imports: $Path"
}

function Replace-Once {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$OldText,
        [Parameter(Mandatory = $true)][string]$NewText
    )

    $content = Get-Content -LiteralPath $Path -Raw

    if ($content.Contains($NewText.Trim())) {
        Write-Host "Already patched: $Path"
        return
    }

    if (-not $content.Contains($OldText)) {
        Write-Host "Anchor not found, skipped: $OldText"
        return
    }

    Backup-File -Path $Path

    [System.IO.File]::WriteAllText(
        $Path,
        $content.Replace($OldText, $NewText),
        $Utf8NoBom
    )

    Write-Host "Patched:   $Path"
}

Assert-Directory -Path $ProjectRoot
Assert-Directory -Path $SampleAppRoot
Assert-Directory -Path $SoundFeatureRoot
Assert-Directory -Path $EnvelopeUiRoot

# ---------------------------------------------------------------------------
# 1. Reusable ADSR Lit 3 component in envelopes-ui
# ---------------------------------------------------------------------------

Write-Utf8File `
    -Path (Join-Path $EnvelopeUiSrc "adsr-envelope-control.component.ts") `
    -Content @'
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import {
  EnvelopeCurveKind,
  EnvelopeKind,
  type IAdsrEnvelopeDefinition,
} from "@monorepo/music-core-synthesizer-envelopes-contracts";

export interface IAdsrEnvelopeControlChangedDetail {
  readonly definition: IAdsrEnvelopeDefinition;
}

@customElement("adsr-envelope-control")
export class AdsrEnvelopeControlComponent extends LitElement {
  @property({ attribute: false })
  public definition: IAdsrEnvelopeDefinition =
    DefaultAdsrEnvelopeDefinitionFactory.create();

  public static override readonly styles = css`
    :host {
      display: grid;
      gap: 10px;
      padding: 12px;
      border: 1px solid #333;
      border-radius: 8px;
    }

    .row {
      display: grid;
      gap: 4px;
    }

    label {
      font-size: 13px;
      font-weight: 600;
    }

    input {
      width: 100%;
    }

    output {
      font-variant-numeric: tabular-nums;
    }
  `;

  protected override render() {
    return html`
      <strong>ADSR Envelope</strong>
      ${this.renderSlider("Attack", "attackSeconds", 0, 2, 0.01, "s")}
      ${this.renderSlider("Decay", "decaySeconds", 0, 2, 0.01, "s")}
      ${this.renderSlider("Sustain", "sustainLevel", 0, 1, 0.01, "")}
      ${this.renderSlider("Release", "releaseSeconds", 0, 4, 0.01, "s")}
    `;
  }

  private renderSlider(
    label: string,
    key: keyof Pick<
      IAdsrEnvelopeDefinition,
      "attackSeconds" | "decaySeconds" | "sustainLevel" | "releaseSeconds"
    >,
    minimum: number,
    maximum: number,
    step: number,
    suffix: string,
  ) {
    const value = this.definition[key];

    return html`
      <div class="row">
        <label>
          ${label}: <output>${value.toFixed(2)}${suffix}</output>
        </label>
        <input
          type="range"
          min=${String(minimum)}
          max=${String(maximum)}
          step=${String(step)}
          .value=${String(value)}
          @input=${(event: Event) => this.patchNumber(key, event)}
        />
      </div>
    `;
  }

  private patchNumber(
    key: keyof Pick<
      IAdsrEnvelopeDefinition,
      "attackSeconds" | "decaySeconds" | "sustainLevel" | "releaseSeconds"
    >,
    event: Event,
  ): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);

    if (!Number.isFinite(value)) {
      return;
    }

    this.definition = {
      ...this.definition,
      [key]: value,
    };

    this.dispatchEvent(
      new CustomEvent<IAdsrEnvelopeControlChangedDetail>(
        "adsr-envelope-control-changed",
        {
          bubbles: true,
          composed: true,
          detail: {
            definition: this.definition,
          },
        },
      ),
    );
  }
}

export class DefaultAdsrEnvelopeDefinitionFactory {
  public static create(): IAdsrEnvelopeDefinition {
    return {
      kind: EnvelopeKind.Adsr,
      attackSeconds: 0.02,
      decaySeconds: 0.14,
      sustainLevel: 0.62,
      releaseSeconds: 0.35,
      attackCurve: { kind: EnvelopeCurveKind.Linear },
      decayCurve: { kind: EnvelopeCurveKind.Linear },
      releaseCurve: { kind: EnvelopeCurveKind.Linear },
    };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "adsr-envelope-control": AdsrEnvelopeControlComponent;
  }
}
'@

Write-Utf8File `
    -Path (Join-Path $EnvelopeUiSrc "index.ts") `
    -Content 'export * from "./adsr-envelope-control.component.js";'

Write-Utf8File `
    -Path (Join-Path $EnvelopeUiSrc "code.ts") `
    -Content 'export * from "./adsr-envelope-control.component.js";'

Add-PackageDependency `
    -PackageJsonPath (Join-Path $EnvelopeUiRoot "package.json") `
    -DependencyName "@monorepo/music-core-synthesizer-envelopes-contracts" `
    -Version "workspace:*"

Add-PackageDependency `
    -PackageJsonPath (Join-Path $EnvelopeUiRoot "package.json") `
    -DependencyName "lit" `
    -Version "^3.0.0"

# ---------------------------------------------------------------------------
# 2. Melody player Lit 3 component in sample app
# ---------------------------------------------------------------------------

Write-Utf8File `
    -Path (Join-Path $SoundFeatureRoot "melody-voice-player.component.ts") `
    -Content @'
import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";

export interface IMelodyVoiceNote {
  readonly frequencyHz: number;
  readonly durationSeconds: number;
  readonly gapSeconds: number;
}

export interface IMelodyVoicePlayerPlayRequestedDetail {
  readonly notes: readonly IMelodyVoiceNote[];
  readonly velocity: number;
}

@customElement("melody-voice-player")
export class MelodyVoicePlayerComponent extends LitElement {
  public static override readonly styles = css`
    :host {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      align-items: center;
    }

    button {
      padding: 8px;
      font: inherit;
    }
  `;

  protected override render() {
    return html`
      <button type="button" @click=${this.playLondonBridge}>
        Play London Bridge
      </button>

      <button type="button" @click=${this.stopMelody}>
        Stop Melody
      </button>
    `;
  }

  private readonly playLondonBridge = (): void => {
    this.dispatchEvent(
      new CustomEvent<IMelodyVoicePlayerPlayRequestedDetail>(
        "melody-voice-player-play-requested",
        {
          bubbles: true,
          composed: true,
          detail: {
            velocity: 0.85,
            notes: LondonBridgeMelody.create(),
          },
        },
      ),
    );
  };

  private readonly stopMelody = (): void => {
    this.dispatchEvent(
      new CustomEvent("melody-voice-player-stop-requested", {
        bubbles: true,
        composed: true,
      }),
    );
  };
}

class LondonBridgeMelody {
  public static create(): readonly IMelodyVoiceNote[] {
    const quarter = 0.34;
    const half = quarter * 2;
    const gap = 0.035;

    return [
      note(MidiNote.G4, quarter, gap),
      note(MidiNote.A4, quarter, gap),
      note(MidiNote.G4, quarter, gap),
      note(MidiNote.F4, quarter, gap),
      note(MidiNote.E4, quarter, gap),
      note(MidiNote.F4, quarter, gap),
      note(MidiNote.G4, half, gap),

      note(MidiNote.D4, quarter, gap),
      note(MidiNote.E4, quarter, gap),
      note(MidiNote.F4, half, gap),

      note(MidiNote.E4, quarter, gap),
      note(MidiNote.F4, quarter, gap),
      note(MidiNote.G4, half, gap),

      note(MidiNote.G4, quarter, gap),
      note(MidiNote.A4, quarter, gap),
      note(MidiNote.G4, quarter, gap),
      note(MidiNote.F4, quarter, gap),
      note(MidiNote.E4, quarter, gap),
      note(MidiNote.F4, quarter, gap),
      note(MidiNote.G4, half, gap),

      note(MidiNote.D4, half, gap),
      note(MidiNote.G4, half, gap),
      note(MidiNote.E4, half, gap),
      note(MidiNote.C4, half, gap),
    ];
  }
}

const MidiNote = {
  C4: 60,
  D4: 62,
  E4: 64,
  F4: 65,
  G4: 67,
  A4: 69,
} as const;

function note(
  midiNoteNumber: number,
  durationSeconds: number,
  gapSeconds: number,
): IMelodyVoiceNote {
  return {
    frequencyHz: 440 * Math.pow(2, (midiNoteNumber - 69) / 12),
    durationSeconds,
    gapSeconds,
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "melody-voice-player": MelodyVoicePlayerComponent;
  }
}
'@

Add-ExportIfMissing `
    -Path (Join-Path $SoundFeatureRoot "index.ts") `
    -ExportLine 'export * from "./melody-voice-player.component.js";'

Add-PackageDependency `
    -PackageJsonPath (Join-Path $SampleAppRoot "package.json") `
    -DependencyName "@monorepo/music-core-synthesizer-envelopes-ui" `
    -Version "workspace:*"

# ---------------------------------------------------------------------------
# 3. Minimal sound-test.component.ts patch
# ---------------------------------------------------------------------------

$SoundTestComponentPath = Join-Path $SoundFeatureRoot "sound-test.component.ts"

$ImportBlock = @'
import "@monorepo/music-core-synthesizer-envelopes-ui";
import type { IAdsrEnvelopeControlChangedDetail } from "@monorepo/music-core-synthesizer-envelopes-ui";
import type { IMelodyVoicePlayerPlayRequestedDetail } from "./melody-voice-player.component.js";
import "./melody-voice-player.component.js";
'@

Insert-BeforeFirstImportIfMissing `
    -Path $SoundTestComponentPath `
    -Needle 'melody-voice-player.component.js' `
    -Block $ImportBlock

Replace-Once `
    -Path $SoundTestComponentPath `
    -OldText 'export class SoundTestComponent extends LitElement {' `
    -NewText @'
export class SoundTestComponent extends LitElement {
  private activeMelodyVoices: Array<{ dispose(): void }> = [];
'@

Replace-Once `
    -Path $SoundTestComponentPath `
    -OldText '<button type="button" @click=${this.releaseNote}>Release</button>' `
    -NewText @'
<button type="button" @click=${this.releaseNote}>Release</button>

          <melody-voice-player
            @melody-voice-player-play-requested=${this.playMelody}
            @melody-voice-player-stop-requested=${this.stopMelody}
          ></melody-voice-player>
'@

Replace-Once `
    -Path $SoundTestComponentPath `
    -OldText '<div class="envelope">' `
    -NewText @'
<adsr-envelope-control
          .definition=${this.voiceDefinition.envelope}
          @adsr-envelope-control-changed=${this.onAdsrEnvelopeChanged}
        ></adsr-envelope-control>

        <div class="envelope">
'@

Replace-Once `
    -Path $SoundTestComponentPath `
    -OldText '  private async ensureAudioContext(): Promise<AudioContext> {' `
    -NewText @'
  private readonly playMelody = async (
    event: CustomEvent<IMelodyVoicePlayerPlayRequestedDetail>,
  ): Promise<void> => {
    const context = await this.ensureAudioContext();
    const factory = this.ensureVoiceFactory(context);

    this.stopMelody();

    let cursorSeconds = context.currentTime + 0.03;

    for (const note of event.detail.notes) {
      const voice = factory.create({
        definition: this.voiceDefinition,
        destination: context.destination,
      });

      voice.gateOn({
        timeSeconds: cursorSeconds,
        frequencyHz: note.frequencyHz,
        velocity: event.detail.velocity,
      });

      voice.gateOff({
        timeSeconds: cursorSeconds + note.durationSeconds,
      });

      this.activeMelodyVoices.push(voice);
      cursorSeconds += note.durationSeconds + note.gapSeconds;
    }
  };

  private readonly stopMelody = (): void => {
    for (const voice of this.activeMelodyVoices) {
      voice.dispose();
    }

    this.activeMelodyVoices = [];
  };

  private readonly onAdsrEnvelopeChanged = (
    event: CustomEvent<IAdsrEnvelopeControlChangedDetail>,
  ): void => {
    this.voiceDefinition = {
      ...this.voiceDefinition,
      envelope: event.detail.definition,
    };
  };

  private async ensureAudioContext(): Promise<AudioContext> {
'@

Replace-Once `
    -Path $SoundTestComponentPath `
    -OldText '  public override disconnectedCallback(): void {' `
    -NewText @'
  public override disconnectedCallback(): void {
    this.stopMelody();
'@

Write-Host ""
Write-Host "Done."
Write-Host "Run:"
Write-Host "  pnpm install"
Write-Host "  pnpm --filter module-basic build"