# FILE: refactor-module-basic-use-midi-streamer-module.ps1

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

$ModuleBasicRoot = Join-Path $ProjectRoot "test-playground\modules-basic-tester"
$SrcRoot = Join-Path $ModuleBasicRoot "src"
$SoundFeatureRoot = Join-Path $SrcRoot "features\soundTestFeature"

$MidiStreamerRoot = Join-Path $ProjectRoot "music-core-synthesizer\functional-modules\midi-streamer"
$MidiStreamerPackageRoot = Join-Path $MidiStreamerRoot "audio-function-midi-streamer"
$MidiStreamerUiPackageRoot = Join-Path $MidiStreamerRoot "audio-function-midi-streamer-ui"

$ModuleBasicPackageJsonPath = Join-Path $ModuleBasicRoot "package.json"
$MidiStreamerIndexPath = Join-Path $MidiStreamerPackageRoot "src\index.ts"
$MidiStreamerUiIndexPath = Join-Path $MidiStreamerUiPackageRoot "src\index.ts"
$MidiStreamerElementPath = Join-Path $MidiStreamerUiPackageRoot "src\components\AudioFunctionMidiStreamerElement.ts"

$CustomElementsPath = Join-Path $SrcRoot "custom-elements.ts"
$MultiViewAppPath = Join-Path $SrcRoot "multi-view-app.ts"

$LocalMidiControllerPath = Join-Path $SoundFeatureRoot "midi-controller.component.ts"
$TwoOscillatorDemoPath = Join-Path $SoundFeatureRoot "two-oscillator-demo.component.ts"
$SoundFeatureIndexPath = Join-Path $SoundFeatureRoot "index.ts"

$SongsDirectory = Join-Path $ModuleBasicRoot "public\midi-songs"
$SongsJsonPath = Join-Path $SongsDirectory "songs.json"

function Assert-Directory {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (-not (Test-Path -LiteralPath $Path -PathType Container)) {
        throw "Directory not found: $Path"
    }
}

function Assert-File {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        throw "File not found: $Path"
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
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
    }

    $normalized = $Content.TrimEnd() + [Environment]::NewLine

    if (Test-Path -LiteralPath $Path -PathType Leaf) {
        $current = Get-Content -LiteralPath $Path -Raw

        if ($current -eq $normalized) {
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
        [Parameter(Mandatory = $true)][string]$DependencyName,
        [Parameter(Mandatory = $true)][string]$Version
    )

    Assert-File -Path $ModuleBasicPackageJsonPath

    $json = Get-Content -LiteralPath $ModuleBasicPackageJsonPath -Raw | ConvertFrom-Json

    if ($null -eq $json.dependencies) {
        Set-JsonProperty -Object $json -Name "dependencies" -Value ([pscustomobject]@{})
    }

    Set-JsonProperty -Object $json.dependencies -Name $DependencyName -Value $Version

    Backup-File -Path $ModuleBasicPackageJsonPath

    [System.IO.File]::WriteAllText(
        $ModuleBasicPackageJsonPath,
        (($json | ConvertTo-Json -Depth 100) + [Environment]::NewLine),
        $Utf8NoBom
    )

    Write-Host "Dependency: $DependencyName -> $Version"
}

function Add-LineIfMissing {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Line
    )

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        Write-Utf8File -Path $Path -Content $Line
        return
    }

    $content = Get-Content -LiteralPath $Path -Raw

    if ($content.Contains($Line)) {
        Write-Host "Already present: $Line"
        return
    }

    Backup-File -Path $Path

    [System.IO.File]::WriteAllText(
        $Path,
        ($Line + [Environment]::NewLine + $content),
        $Utf8NoBom
    )

    Write-Host "Patched:   $Path"
}

function Remove-LineContaining {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Needle
    )

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        return
    }

    $content = Get-Content -LiteralPath $Path -Raw
    $lines = $content -split "\r?\n"
    $nextLines = @($lines | Where-Object { -not $_.Contains($Needle) })
    $next = ($nextLines -join [Environment]::NewLine).TrimEnd() + [Environment]::NewLine

    if ($next -eq $content) {
        return
    }

    Backup-File -Path $Path
    [System.IO.File]::WriteAllText($Path, $next, $Utf8NoBom)
    Write-Host "Removed reference: $Needle"
}

function New-LondonBridgeSongsJson {
    $ticksPerQuarterNote = 480
    $cursorTick = 0

    $notes = @(
        @{ Note = 67; Beats = 1 },
        @{ Note = 69; Beats = 1 },
        @{ Note = 67; Beats = 1 },
        @{ Note = 65; Beats = 1 },
        @{ Note = 64; Beats = 1 },
        @{ Note = 65; Beats = 1 },
        @{ Note = 67; Beats = 2 },

        @{ Note = 62; Beats = 1 },
        @{ Note = 64; Beats = 1 },
        @{ Note = 65; Beats = 2 },

        @{ Note = 64; Beats = 1 },
        @{ Note = 65; Beats = 1 },
        @{ Note = 67; Beats = 2 },

        @{ Note = 67; Beats = 1 },
        @{ Note = 69; Beats = 1 },
        @{ Note = 67; Beats = 1 },
        @{ Note = 65; Beats = 1 },
        @{ Note = 64; Beats = 1 },
        @{ Note = 65; Beats = 1 },
        @{ Note = 67; Beats = 2 },

        @{ Note = 62; Beats = 2 },
        @{ Note = 67; Beats = 2 },
        @{ Note = 64; Beats = 2 },
        @{ Note = 60; Beats = 2 }
    )

    $events = New-Object System.Collections.Generic.List[object]

    foreach ($note in $notes) {
        $durationTicks = [int]($note.Beats * $ticksPerQuarterNote)

        $events.Add([pscustomobject]@{
            tick = $cursorTick
            message = [pscustomobject]@{
                kind = "note-on"
                channel = 0
                note = $note.Note
                velocity = 105
            }
        })

        $events.Add([pscustomobject]@{
            tick = $cursorTick + $durationTicks
            message = [pscustomobject]@{
                kind = "note-off"
                channel = 0
                note = $note.Note
                velocity = 0
            }
        })

        $cursorTick += $durationTicks
    }

    $root = [pscustomobject]@{
        songs = @(
            [pscustomobject]@{
                id = "london-bridge"
                title = "London Bridge Is Falling Down"
                tempoBpm = 105
                ticksPerQuarterNote = $ticksPerQuarterNote
                events = $events
            }
        )
    }

    return $root | ConvertTo-Json -Depth 20
}

Assert-Directory -Path $ProjectRoot
Assert-Directory -Path $ModuleBasicRoot
Assert-Directory -Path $SrcRoot
Assert-Directory -Path $SoundFeatureRoot
Assert-Directory -Path $MidiStreamerPackageRoot
Assert-Directory -Path $MidiStreamerUiPackageRoot

Write-Utf8File `
    -Path $MidiStreamerIndexPath `
    -Content @'
export * from "./application/MidiSongStreamer.js";
export * from "./composition/MidiSongStreamerFactory.js";
export * from "./domain/MidiSongValidationError.js";
export * from "./domain/MidiSongValidator.js";
export * from "./infrastructure/TimeoutMidiStreamScheduler.js";
'@

Write-Utf8File `
    -Path $MidiStreamerUiIndexPath `
    -Content @'
export * from "./components/AudioFunctionMidiStreamerElement.js";
export * from "./components/defineAudioFunctionMidiStreamerElement.js";
'@

Write-Utf8File `
    -Path $MidiStreamerElementPath `
    -Content @'
import { css, html, LitElement, type PropertyValues } from "lit";
import {
  MidiStreamerDomEvents,
  type IMidiSongStreamer,
  type MidiSong,
  type MidiStreamSubscription,
} from "@monorepo/audio-function-midi-streamer-contracts";
import { DomMidiStreamSink } from "../internal/DomMidiStreamSink.js";
import { MidiSongCatalogJsonParser } from "../internal/MidiSongCatalogJsonParser.js";

export class AudioFunctionMidiStreamerElement extends LitElement {
  public static override readonly styles = css`
    :host {
      display: block;
      box-sizing: border-box;
      font-family: system-ui, sans-serif;
    }

    .root {
      display: grid;
      gap: 0.75rem;
    }

    .toolbar {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      align-items: center;
    }

    label {
      display: grid;
      gap: 0.25rem;
      font-size: 0.875rem;
    }

    select {
      min-height: 2rem;
      font: inherit;
    }

    button {
      padding: 0.5rem 0.75rem;
      font: inherit;
      cursor: pointer;
    }

    button:disabled,
    select:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }

    .status {
      font-size: 0.75rem;
      opacity: 0.75;
    }
  `;

  public static override readonly properties = {
    songs: { attribute: false },
    songSourceUrl: { attribute: "song-source-url" },
    selectedSongId: { state: true },
    disabled: { type: Boolean, reflect: true },
    isPlaying: { state: true },
    status: { state: true },
  };

  public songs: readonly MidiSong[] = [];
  public songSourceUrl = "";
  public selectedSongId = "";
  public disabled = false;
  public streamer: IMidiSongStreamer | undefined = undefined;

  private readonly parser = new MidiSongCatalogJsonParser();
  private currentSubscription: MidiStreamSubscription | undefined = undefined;
  private isPlaying = false;
  private status = "No songs loaded";

  public override disconnectedCallback(): void {
    this.stopCurrentStream(false);
    super.disconnectedCallback();
  }

  protected override updated(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has("songSourceUrl")) {
      void this.loadSongsFromSourceUrl();
    }

    if (changedProperties.has("songs") && this.selectedSongId.length === 0) {
      this.selectedSongId = this.songs[0]?.id ?? "";
    }
  }

  protected override render(): unknown {
    const hasSongs = this.songs.length > 0;

    return html`
      <section class="root">
        <label>
          Song
          <select
            .value=${this.selectedSongId}
            ?disabled=${this.disabled || this.isPlaying || !hasSongs}
            @change=${this.handleSongChanged}
          >
            ${this.songs.map(
              (song) => html`
                <option value=${song.id}>${song.title}</option>
              `,
            )}
          </select>
        </label>

        <div class="toolbar">
          <button
            type="button"
            ?disabled=${this.disabled || this.isPlaying || !hasSongs}
            @click=${this.playSelectedSong}
          >
            Play
          </button>

          <button
            type="button"
            ?disabled=${this.disabled || !this.isPlaying}
            @click=${this.stopByUser}
          >
            Stop
          </button>
        </div>

        <div class="status">${this.status}</div>

        <slot name="midi-data"></slot>
      </section>
    `;
  }

  private async loadSongsFromSourceUrl(): Promise<void> {
    const sourceUrl = this.songSourceUrl.trim();

    if (sourceUrl.length === 0) {
      return;
    }

    try {
      const response = await fetch(sourceUrl);

      if (!response.ok) {
        throw new Error(`Failed to load MIDI songs. HTTP status: ${response.status}.`);
      }

      const json = (await response.json()) as unknown;
      this.songs = this.parser.parse(json);
      this.selectedSongId = this.songs[0]?.id ?? "";
      this.status = this.songs.length > 0
        ? `${this.songs.length} song(s) loaded`
        : "No songs loaded";

      this.dispatchEvent(
        new CustomEvent(MidiStreamerDomEvents.songsLoaded, {
          bubbles: true,
          composed: true,
          detail: {
            count: this.songs.length,
          },
        }),
      );
    } catch (error) {
      this.dispatchFailure(this.getErrorMessage(error));
    }
  }

  private readonly handleSongChanged = (event: Event): void => {
    const target = event.target;

    if (!(target instanceof HTMLSelectElement)) {
      return;
    }

    this.selectedSongId = target.value;
    this.status = `Selected: ${target.value}`;
  };

  private readonly playSelectedSong = (): void => {
    const song = this.songs.find((candidate) => candidate.id === this.selectedSongId);

    if (song === undefined) {
      this.dispatchFailure(`Song not found: ${this.selectedSongId}`);
      return;
    }

    if (this.streamer === undefined) {
      this.dispatchFailure("No MIDI song streamer has been configured.");
      return;
    }

    this.stopCurrentStream(false);

    this.isPlaying = true;
    this.status = `Playing: ${song.title}`;

    this.dispatchEvent(
      new CustomEvent(MidiStreamerDomEvents.songSelected, {
        bubbles: true,
        composed: true,
        detail: {
          songId: song.id,
          title: song.title,
        },
      }),
    );

    this.currentSubscription = this.streamer.stream(
      song,
      new DomMidiStreamSink(this),
    );
  };

  private readonly stopByUser = (): void => {
    this.stopCurrentStream(true);
  };

  private stopCurrentStream(updateStatus: boolean): void {
    if (this.currentSubscription !== undefined) {
      this.currentSubscription.cancel();
      this.currentSubscription = undefined;
    }

    this.isPlaying = false;

    if (updateStatus) {
      this.status = "Stopped";
    }
  }

  private dispatchFailure(message: string): void {
    this.stopCurrentStream(false);
    this.status = `Failed: ${message}`;

    this.dispatchEvent(
      new CustomEvent(MidiStreamerDomEvents.streamFailed, {
        bubbles: true,
        composed: true,
        detail: {
          songId: this.selectedSongId,
          message,
        },
      }),
    );
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return "Unknown MIDI streamer error.";
  }
}
'@

Write-Utf8File `
    -Path $TwoOscillatorDemoPath `
    -Content @'
import { MidiSongStreamerFactory } from "@monorepo/audio-function-midi-streamer";
import {
  MidiMessageKinds,
  MidiStreamerDomEvents,
  type MidiMessage,
  type MidiStreamFailure,
  type MidiStreamMessage,
} from "@monorepo/audio-function-midi-streamer-contracts";
import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";

import type { OscillatorDefinition } from "@monorepo/music-core-synthesizer-oscillators-contracts";

import {
  SoundController,
  type OscillatorIndex,
} from "./SoundController.js";

type OscillatorDefinitionChangedEvent = CustomEvent<{
  readonly definition: OscillatorDefinition;
}>;

type MidiStreamMessageEvent = CustomEvent<MidiStreamMessage>;
type MidiStreamFailureEvent = CustomEvent<MidiStreamFailure>;

@customElement("two-oscillator-demo")
export class TwoOscillatorDemoComponent extends LitElement {
  private readonly soundController = new SoundController();
  private readonly midiStreamer = new MidiSongStreamerFactory().createBrowserDefault();

  @state()
  private status = "Ready";

  @state()
  private oscillatorADefinition = this.soundController.getOscillatorDefinition(0);

  @state()
  private oscillatorBDefinition = this.soundController.getOscillatorDefinition(1);

  public static override readonly styles = css`
    :host {
      display: block;
    }

    .layout {
      display: grid;
      gap: 16px;
    }

    .toolbar,
    .controls {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      align-items: flex-start;
    }

    button {
      padding: 8px 12px;
      font: inherit;
      cursor: pointer;
    }

    .status {
      padding: 8px 12px;
      border: 1px solid #333;
      border-radius: 8px;
      font-size: 13px;
    }

    audio-function-midi-streamer {
      display: block;
      min-width: 320px;
      padding: 12px;
      border: 1px solid #333;
      border-radius: 8px;
    }
  `;

  public override render() {
    return html`
      <section class="layout">
        <h1>Oscillator View</h1>

        <div class="toolbar">
          <button type="button" @click=${this.playC4}>Play C4</button>
          <button type="button" @click=${this.stop}>Stop</button>
        </div>

        <div class="status">${this.status}</div>

        <div class="controls">
          <oscillator-control
            label="Oscillator A"
            .definition=${this.oscillatorADefinition}
            @oscillator-control-definition-changed=${(
              event: OscillatorDefinitionChangedEvent,
            ) => this.onOscillatorDefinitionChanged(0, event)}
          ></oscillator-control>

          <oscillator-control
            label="Oscillator B"
            .definition=${this.oscillatorBDefinition}
            @oscillator-control-definition-changed=${(
              event: OscillatorDefinitionChangedEvent,
            ) => this.onOscillatorDefinitionChanged(1, event)}
          ></oscillator-control>

          <audio-function-midi-streamer
            .streamer=${this.midiStreamer}
            song-source-url="/midi-songs/songs.json"
            @audio-function-midi-streamer:song-selected=${this.onMidiSongSelected}
            @audio-function-midi-streamer:midi-message=${this.onMidiMessage}
            @audio-function-midi-streamer:stream-completed=${this.onMidiCompleted}
            @audio-function-midi-streamer:stream-failed=${this.onMidiFailed}
          ></audio-function-midi-streamer>
        </div>
      </section>
    `;
  }

  public override disconnectedCallback(): void {
    this.soundController.noteOff();
    super.disconnectedCallback();
  }

  private readonly playC4 = async (): Promise<void> => {
    await this.soundController.init();
    this.soundController.noteOn(60, 0.85);
    this.status = "Playing C4 with two oscillators";
  };

  private readonly stop = (): void => {
    this.soundController.noteOff();
    this.status = "Stopped";
  };

  private onOscillatorDefinitionChanged(
    index: OscillatorIndex,
    event: OscillatorDefinitionChangedEvent,
  ): void {
    this.soundController.setOscillatorDefinition(index, event.detail.definition);

    if (index === 0) {
      this.oscillatorADefinition = event.detail.definition;
    } else {
      this.oscillatorBDefinition = event.detail.definition;
    }

    this.status = `Oscillator ${index === 0 ? "A" : "B"} changed`;
  }

  private readonly onMidiSongSelected = async (): Promise<void> => {
    await this.soundController.init();
    this.status = "MIDI song selected";
  };

  private readonly onMidiMessage = async (
    event: MidiStreamMessageEvent,
  ): Promise<void> => {
    await this.soundController.handleMidiMessage(event.detail.message);
    this.status =
      `MIDI ${event.detail.eventIndex + 1}: ${MidiMessageFormatter.format(event.detail.message)}`;
  };

  private readonly onMidiCompleted = (): void => {
    this.soundController.noteOff();
    this.status = "MIDI completed";
  };

  private readonly onMidiFailed = (event: MidiStreamFailureEvent): void => {
    this.soundController.noteOff();
    this.status = `MIDI failed: ${event.detail.message}`;
  };
}

class MidiMessageFormatter {
  public static format(message: MidiMessage): string {
    switch (message.kind) {
      case MidiMessageKinds.noteOn:
        return `note-on ch=${message.channel} note=${message.note} velocity=${message.velocity}`;

      case MidiMessageKinds.noteOff:
        return `note-off ch=${message.channel} note=${message.note}`;

      case MidiMessageKinds.controlChange:
        return `cc ch=${message.channel} controller=${message.controller} value=${message.value}`;

      case MidiMessageKinds.pitchBend:
        return `pitch-bend ch=${message.channel} value=${message.value}`;

      case MidiMessageKinds.systemExclusive:
        return `sysex bytes=${message.data.length}`;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "two-oscillator-demo": TwoOscillatorDemoComponent;
  }
}
'@

Write-Utf8File `
    -Path $SongsJsonPath `
    -Content (New-LondonBridgeSongsJson)

Add-PackageDependency `
    -DependencyName "@monorepo/audio-function-midi-streamer" `
    -Version "workspace:*"

Add-PackageDependency `
    -DependencyName "@monorepo/audio-function-midi-streamer-contracts" `
    -Version "workspace:*"

Add-PackageDependency `
    -DependencyName "@monorepo/audio-function-midi-streamer-ui" `
    -Version "workspace:*"

if (Test-Path -LiteralPath $LocalMidiControllerPath -PathType Leaf) {
    Backup-File -Path $LocalMidiControllerPath
    Remove-Item -LiteralPath $LocalMidiControllerPath -Force
    Write-Host "Deleted:   $LocalMidiControllerPath"
}

Remove-LineContaining `
    -Path $SoundFeatureIndexPath `
    -Needle "midi-controller.component"

Write-Utf8File `
    -Path $CustomElementsPath `
    -Content @'
import { defineAudioFunctionMidiStreamerElement } from "../../../music-core-synthesizer/functional-modules/midi-streamer/audio-function-midi-streamer-ui/src/index.js";

import "../../../music-core-synthesizer/modules/music-core-synthesizer-oscillators-web-ui/src/index.js";

defineAudioFunctionMidiStreamerElement();
'@

Add-LineIfMissing `
    -Path $MultiViewAppPath `
    -Line 'import "./custom-elements.js";'

Write-Host ""
Write-Host "Done."
Write-Host ""
Write-Host "Deleted local MIDI controller:"
Write-Host "  src\features\soundTestFeature\midi-controller.component.ts"
Write-Host ""
Write-Host "Run from monorepo root:"
Write-Host '  cd "C:\Users\danha\source\repos\HTML\MonoRepro"'
Write-Host "  pnpm install"
Write-Host "  pnpm --filter @monorepo/audio-function-midi-streamer-contracts build"
Write-Host "  pnpm --filter @monorepo/audio-function-midi-streamer build"
Write-Host "  pnpm --filter @monorepo/audio-function-midi-streamer-ui build"
Write-Host "  pnpm --filter module-basic build"