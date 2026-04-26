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

function Assert-DirectoryExists {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    if (-not (Test-Path -LiteralPath $Path -PathType Container)) {
        throw "Directory not found: $Path"
    }
}

function Backup-File {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    if (Test-Path -LiteralPath $Path -PathType Leaf) {
        Copy-Item `
            -LiteralPath $Path `
            -Destination "$Path.bak.$BackupStamp" `
            -Force
    }
}

function Write-TextFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [string]$Content
    )

    $directory = Split-Path -Parent $Path

    if (-not (Test-Path -LiteralPath $directory -PathType Container)) {
        New-Item -ItemType Directory -Path $directory | Out-Null
    }

    $normalized = $Content.TrimEnd() + [Environment]::NewLine

    if (Test-Path -LiteralPath $Path -PathType Leaf) {
        $existing = Get-Content -LiteralPath $Path -Raw

        if ($existing -eq $normalized) {
            Write-Host "Unchanged: $Path"
            return
        }

        Backup-File -Path $Path
    }

    [System.IO.File]::WriteAllText($Path, $normalized, $Utf8NoBom)
    Write-Host "Written:   $Path"
}

function Set-JsonProperty {
    param(
        [Parameter(Mandatory = $true)]
        [pscustomobject]$Object,

        [Parameter(Mandatory = $true)]
        [string]$Name,

        [Parameter(Mandatory = $true)]
        [object]$Value
    )

    if ($Object.PSObject.Properties.Name -contains $Name) {
        $Object.$Name = $Value
        return
    }

    Add-Member `
        -InputObject $Object `
        -NotePropertyName $Name `
        -NotePropertyValue $Value
}

function Add-PackageDependency {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PackageJsonPath,

        [Parameter(Mandatory = $true)]
        [string]$DependencyName,

        [Parameter(Mandatory = $true)]
        [string]$Version
    )

    if (-not (Test-Path -LiteralPath $PackageJsonPath -PathType Leaf)) {
        Write-Host "Skipped package.json dependency. File not found: $PackageJsonPath"
        return
    }

    $json = Get-Content -LiteralPath $PackageJsonPath -Raw | ConvertFrom-Json

    if ($null -eq $json.dependencies) {
        Set-JsonProperty `
            -Object $json `
            -Name "dependencies" `
            -Value ([pscustomobject]@{})
    }

    Set-JsonProperty `
        -Object $json.dependencies `
        -Name $DependencyName `
        -Value $Version

    Backup-File -Path $PackageJsonPath

    [System.IO.File]::WriteAllText(
        $PackageJsonPath,
        (($json | ConvertTo-Json -Depth 100) + [Environment]::NewLine),
        $Utf8NoBom
    )

    Write-Host "Updated dependency: $DependencyName -> $Version"
}

function Add-TextIfMissing {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [string]$Needle,

        [Parameter(Mandatory = $true)]
        [string]$TextToPrepend
    )

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        throw "File not found: $Path"
    }

    $content = Get-Content -LiteralPath $Path -Raw

    if ($content.Contains($Needle)) {
        Write-Host "Already patched: $Path"
        return
    }

    Backup-File -Path $Path

    [System.IO.File]::WriteAllText(
        $Path,
        ($TextToPrepend.TrimEnd() + [Environment]::NewLine + [Environment]::NewLine + $content),
        $Utf8NoBom
    )

    Write-Host "Patched:   $Path"
}

function Replace-TextIfFound {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [string]$OldText,

        [Parameter(Mandatory = $true)]
        [string]$NewText
    )

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        throw "File not found: $Path"
    }

    $content = Get-Content -LiteralPath $Path -Raw

    if ($content.Contains($NewText.Trim())) {
        Write-Host "Already patched: $Path"
        return
    }

    if (-not $content.Contains($OldText)) {
        Write-Host "Anchor not found, skipped: $Path"
        return
    }

    Backup-File -Path $Path

    $patched = $content.Replace($OldText, $NewText)

    [System.IO.File]::WriteAllText($Path, $patched, $Utf8NoBom)
    Write-Host "Patched:   $Path"
}

Assert-DirectoryExists -Path $ProjectRoot
Assert-DirectoryExists -Path $SampleAppRoot
Assert-DirectoryExists -Path $SoundFeatureRoot
Assert-DirectoryExists -Path $EnvelopeUiRoot

# ---------------------------------------------------------------------------
# 1. Reusable ADSR Lit 3 component in:
#    music-core-synthesizer-envelopes-ui
# ---------------------------------------------------------------------------

$AdsrEnvelopeComponentPath = Join-Path $EnvelopeUiSrc "adsr-envelope-control.component.ts"

$AdsrEnvelopeComponent = @'
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import {
  EnvelopeCurveKind,
  EnvelopeKind,
  type IAdsrEnvelopeDefinition,
} from "@monorepo/music-core-synthesizer-envelopes-contracts";

export const AdsrEnvelopeControlEvent = {
  Changed: "adsr-envelope-control-changed",
} as const;

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

    .header {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
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
      <section>
        <div class="header">
          <strong>ADSR Envelope</strong>
          <span>${this.definition.kind}</span>
        </div>

        ${this.renderSecondsSlider("Attack", "attackSeconds", 0, 2, 0.01)}
        ${this.renderSecondsSlider("Decay", "decaySeconds", 0, 2, 0.01)}
        ${this.renderLevelSlider("Sustain", "sustainLevel", 0, 1, 0.01)}
        ${this.renderSecondsSlider("Release", "releaseSeconds", 0, 4, 0.01)}
      </section>
    `;
  }

  private renderSecondsSlider(
    label: string,
    key: keyof Pick<IAdsrEnvelopeDefinition, "attackSeconds" | "decaySeconds" | "releaseSeconds">,
    minimum: number,
    maximum: number,
    step: number,
  ) {
    const value = this.definition[key];

    return html`
      <div class="row">
        <label>
          ${label}: <output>${value.toFixed(2)}s</output>
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

  private renderLevelSlider(
    label: string,
    key: keyof Pick<IAdsrEnvelopeDefinition, "sustainLevel">,
    minimum: number,
    maximum: number,
    step: number,
  ) {
    const value = this.definition[key];

    return html`
      <div class="row">
        <label>
          ${label}: <output>${value.toFixed(2)}</output>
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

    this.dispatchChanged();
  }

  private dispatchChanged(): void {
    this.dispatchEvent(
      new CustomEvent<IAdsrEnvelopeControlChangedDetail>(
        AdsrEnvelopeControlEvent.Changed,
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

Write-TextFile -Path $AdsrEnvelopeComponentPath -Content $AdsrEnvelopeComponent

Write-TextFile `
    -Path (Join-Path $EnvelopeUiSrc "code.ts") `
    -Content 'export * from "./adsr-envelope-control.component.js";'

Write-TextFile `
    -Path (Join-Path $EnvelopeUiSrc "index.ts") `
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
# 2. Melody player as its own Lit 3 component in the sample app.
#    Keeps melody UI out of sound-test.component.ts.
# ---------------------------------------------------------------------------

$MelodyComponentPath = Join-Path $SoundFeatureRoot "melody-voice-player.component.ts"

$MelodyComponent = @'
import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";

export const MelodyVoicePlayerEvent = {
  PlayRequested: "melody-voice-player-play-requested",
  StopRequested: "melody-voice-player-stop-requested",
} as const;

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
      <button type="button" @click=${this.requestLondonBridgePlayback}>
        Play London Bridge
      </button>

      <button type="button" @click=${this.requestStop}>
        Stop Melody
      </button>
    `;
  }

  private readonly requestLondonBridgePlayback = (): void => {
    this.dispatchEvent(
      new CustomEvent<IMelodyVoicePlayerPlayRequestedDetail>(
        MelodyVoicePlayerEvent.PlayRequested,
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

  private readonly requestStop = (): void => {
    this.dispatchEvent(
      new CustomEvent(MelodyVoicePlayerEvent.StopRequested, {
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
    frequencyHz: EqualTemperamentFrequency.fromMidiNoteNumber(midiNoteNumber),
    durationSeconds,
    gapSeconds,
  };
}

class EqualTemperamentFrequency {
  public static fromMidiNoteNumber(midiNoteNumber: number): number {
    return 440 * Math.pow(2, (midiNoteNumber - 69) / 12);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "melody-voice-player": MelodyVoicePlayerComponent;
  }
}
'@

Write-TextFile -Path $MelodyComponentPath -Content $MelodyComponent

# ---------------------------------------------------------------------------
# 3. Local feature index wiring.
# ---------------------------------------------------------------------------

$SoundFeatureIndexPath = Join-Path $SoundFeatureRoot "index.ts"

if (Test-Path -LiteralPath $SoundFeatureIndexPath -PathType Leaf) {
    $indexContent = Get-Content -LiteralPath $SoundFeatureIndexPath -Raw

    if (-not $indexContent.Contains('./melody-voice-player.component.js')) {
        Backup-File -Path $SoundFeatureIndexPath
        Add-Content `
            -LiteralPath $SoundFeatureIndexPath `
            -Value 'export * from "./melody-voice-player.component.js";'
        Write-Host "Patched:   $SoundFeatureIndexPath"
    }
    else {
        Write-Host "Already patched: $SoundFeatureIndexPath"
    }
}
else {
    Write-TextFile `
        -Path $SoundFeatureIndexPath `
        -Content 'export * from "./melody-voice-player.component.js";'
}

# ---------------------------------------------------------------------------
# 4. Sample app package wiring.
# ---------------------------------------------------------------------------

Add-PackageDependency `
    -PackageJsonPath (Join-Path $SampleAppRoot "package.json") `
    -DependencyName "@monorepo/music-core-synthesizer-envelopes-ui" `
    -Version "workspace:*"

# ---------------------------------------------------------------------------
# 5. Conservative sound-test.component.ts integration.
#    This only patches when the expected anchors exist.
# ---------------------------------------------------------------------------

$SoundTestComponentPath = Join-Path $SoundFeatureRoot "sound-test.component.ts"

$SoundTestImports = @'
import "@monorepo/music-core-synthesizer-envelopes-ui";
import {
  AdsrEnvelopeControlEvent,
  type IAdsrEnvelopeControlChangedDetail,
} from "@monorepo/music-core-synthesizer-envelopes-ui";
import {
  MelodyVoicePlayerEvent,
  type IMelodyVoicePlayerPlayRequestedDetail,
} from "./melody-voice-player.component.js";
import "./melody-voice-player.component.js";
'@

Add-TextIfMissing `
    -Path $SoundTestComponentPath `
    -Needle 'melody-voice-player.component.js' `
    -TextToPrepend $SoundTestImports

$ClassAnchor = 'export class SoundTestComponent extends LitElement {'
$ClassPatch = @'
export class SoundTestComponent extends LitElement {
  private activeMelodyVoices: Array<{ dispose(): void }> = [];
'@

Replace-TextIfFound `
    -Path $SoundTestComponentPath `
    -OldText $ClassAnchor `
    -NewText $ClassPatch

$ToolbarAnchor = '<button type="button" @click=${this.releaseNote}>Release</button>'
$ToolbarPatch = @'
<button type="button" @click=${this.releaseNote}>Release</button>

          <melody-voice-player
            @melody-voice-player-play-requested=${this.playMelody}
            @melody-voice-player-stop-requested=${this.stopMelody}
          ></melody-voice-player>
'@

Replace-TextIfFound `
    -Path $SoundTestComponentPath `
    -OldText $ToolbarAnchor `
    -NewText $ToolbarPatch

$EnvelopeAnchor = '<div class="envelope">'
$EnvelopePatch = @'
<adsr-envelope-control
          .definition=${this.voiceDefinition.envelope}
          @adsr-envelope-control-changed=${this.onAdsrEnvelopeChanged}
        ></adsr-envelope-control>

        <div class="envelope">
'@

Replace-TextIfFound `
    -Path $SoundTestComponentPath `
    -OldText $EnvelopeAnchor `
    -NewText $EnvelopePatch

$EnsureAudioContextAnchor = '  private async ensureAudioContext(): Promise<AudioContext> {'
$MethodsPatch = @'
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

Replace-TextIfFound `
    -Path $SoundTestComponentPath `
    -OldText $EnsureAudioContextAnchor `
    -NewText $MethodsPatch

$DisconnectedAnchor = '  public override disconnectedCallback(): void {'
$DisconnectedPatch = @'
  public override disconnectedCallback(): void {
    this.stopMelody();
'@

Replace-TextIfFound `
    -Path $SoundTestComponentPath `
    -OldText $DisconnectedAnchor `
    -NewText $DisconnectedPatch

Write-Host ""
Write-Host "Done."
Write-Host "Run:"
Write-Host "  pnpm install"
Write-Host "  pnpm --filter module-basic build"