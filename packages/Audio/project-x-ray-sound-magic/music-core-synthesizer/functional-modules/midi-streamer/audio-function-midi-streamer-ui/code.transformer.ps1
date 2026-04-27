# FILE: refactor-module-basic-midi-to-streamer.ps1

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
$SoundFeatureRoot = Join-Path $ModuleBasicRoot "src\features\soundTestFeature"

$MidiStreamerRoot = Join-Path $ProjectRoot "music-core-synthesizer\functional-modules\midi-streamer"
$MidiStreamerPackageRoot = Join-Path $MidiStreamerRoot "audio-function-midi-streamer"
$MidiStreamerUiPackageRoot = Join-Path $MidiStreamerRoot "audio-function-midi-streamer-ui"

$ModuleBasicPackageJsonPath = Join-Path $ModuleBasicRoot "package.json"
$MidiStreamerIndexPath = Join-Path $MidiStreamerPackageRoot "src\index.ts"
$MidiStreamerUiIndexPath = Join-Path $MidiStreamerUiPackageRoot "src\index.ts"
$MidiControllerPath = Join-Path $SoundFeatureRoot "midi-controller.component.ts"
$SoundControllerPath = Join-Path $SoundFeatureRoot "SoundController.ts"

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
        [Parameter(Mandatory = $true)][string]$PackageJsonPath,
        [Parameter(Mandatory = $true)][string]$DependencyName,
        [Parameter(Mandatory = $true)][string]$Version
    )

    Assert-File -Path $PackageJsonPath

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

Assert-Directory -Path $ProjectRoot
Assert-Directory -Path $ModuleBasicRoot
Assert-Directory -Path $SoundFeatureRoot
Assert-Directory -Path $MidiStreamerPackageRoot
Assert-Directory -Path $MidiStreamerUiPackageRoot

Assert-File -Path $ModuleBasicPackageJsonPath
Assert-File -Path $MidiControllerPath
Assert-File -Path $SoundControllerPath

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

Add-PackageDependency `
    -PackageJsonPath $ModuleBasicPackageJsonPath `
    -DependencyName "@monorepo/audio-function-midi-streamer" `
    -Version "workspace:*"

Add-PackageDependency `
    -PackageJsonPath $ModuleBasicPackageJsonPath `
    -DependencyName "@monorepo/audio-function-midi-streamer-contracts" `
    -Version "workspace:*"

Write-Utf8File `
    -Path $MidiControllerPath `
    -Content @'
import {
  MidiSongStreamerFactory,
} from "@monorepo/audio-function-midi-streamer";
import {
  MidiMessageKinds,
  type IMidiStreamSink,
  type MidiMessage,
  type MidiSong,
  type MidiStreamCompleted,
  type MidiStreamFailure,
  type MidiStreamMessage,
  type MidiStreamSubscription,
} from "@monorepo/audio-function-midi-streamer-contracts";
import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";

export const MidiControllerEvents = {
  message: "midi-message",
  started: "midi-song-started",
  stopped: "midi-song-stopped",
  completed: "midi-song-completed",
} as const;

export interface IMidiControllerStepView {
  readonly token: string;
  readonly tick: number;
}

export type MidiMessageStreamEvent = CustomEvent<{
  readonly message: MidiMessage;
  readonly streamEvent: MidiStreamMessage;
  readonly step: IMidiControllerStepView;
  readonly stepIndex: number;
}>;

@customElement("midi-controller")
export class MidiControllerComponent extends LitElement {
  private readonly song: MidiSong = LondonBridgeSongFactory.create();
  private readonly streamer = new MidiSongStreamerFactory().createBrowserDefault();

  private currentSubscription: MidiStreamSubscription | null = null;

  @state()
  private isPlaying = false;

  @state()
  private currentStepIndex = -1;

  @state()
  private status = "Stopped";

  public override disconnectedCallback(): void {
    this.stop(false);
    super.disconnectedCallback();
  }

  protected override render() {
    return html`
      <section class="midi-controller">
        <h2>MIDI Controller</h2>
        <p>${this.song.title}</p>

        <div class="toolbar">
          <button type="button" @click=${this.play} ?disabled=${this.isPlaying}>
            Play Song
          </button>

          <button type="button" @click=${this.requestStop} ?disabled=${!this.isPlaying}>
            Stop Song
          </button>
        </div>

        <pre>${this.renderStatusText()}</pre>
      </section>
    `;
  }

  private readonly play = (): void => {
    this.stop(false);

    this.isPlaying = true;
    this.currentStepIndex = -1;
    this.status = "Starting...";

    this.dispatchEvent(
      new CustomEvent(MidiControllerEvents.started, {
        bubbles: true,
        composed: true,
      }),
    );

    this.currentSubscription = this.streamer.stream(
      this.song,
      this.createSink(),
    );
  };

  private readonly requestStop = (): void => {
    this.stop(true);
  };

  private stop(dispatchStoppedEvent: boolean): void {
    if (this.currentSubscription !== null) {
      this.currentSubscription.cancel();
      this.currentSubscription = null;
    }

    this.isPlaying = false;
    this.currentStepIndex = -1;
    this.status = "Stopped";

    if (dispatchStoppedEvent) {
      this.dispatchEvent(
        new CustomEvent(MidiControllerEvents.stopped, {
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  private createSink(): IMidiStreamSink {
    return {
      send: (event): void => this.handleStreamMessage(event),
      complete: (event): void => this.handleStreamCompleted(event),
      fail: (error): void => this.handleStreamFailed(error),
    };
  }

  private handleStreamMessage(event: MidiStreamMessage): void {
    if (!this.isPlaying) {
      return;
    }

    this.currentStepIndex = event.eventIndex;

    const step: IMidiControllerStepView = {
      token: MidiMessageFormatter.format(event.message),
      tick: event.tick,
    };

    this.status = `Playing ${event.eventIndex + 1}/${this.song.events.length}: ${step.token}`;

    this.dispatchEvent(
      new CustomEvent(MidiControllerEvents.message, {
        detail: {
          message: event.message,
          streamEvent: event,
          step,
          stepIndex: event.eventIndex,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleStreamCompleted(_event: MidiStreamCompleted): void {
    this.currentSubscription = null;
    this.isPlaying = false;
    this.currentStepIndex = -1;
    this.status = "Completed";

    this.dispatchEvent(
      new CustomEvent(MidiControllerEvents.completed, {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleStreamFailed(error: MidiStreamFailure): void {
    this.currentSubscription = null;
    this.isPlaying = false;
    this.currentStepIndex = -1;
    this.status = `Failed: ${error.message}`;

    this.dispatchEvent(
      new CustomEvent(MidiControllerEvents.stopped, {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private renderStatusText(): string {
    if (!this.isPlaying) {
      return this.status;
    }

    return this.status;
  }

  public static override readonly styles = css`
    :host {
      display: block;
      margin-top: 16px;
      padding: 12px;
      border: 1px solid #333;
      border-radius: 8px;
      max-width: 360px;
      font-family: system-ui, sans-serif;
    }

    .midi-controller {
      display: grid;
      gap: 8px;
    }

    .toolbar {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    h2,
    p {
      margin: 0;
    }

    button {
      padding: 8px 12px;
      font-size: 14px;
      cursor: pointer;
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }

    pre {
      margin: 0;
      white-space: pre-wrap;
      font-size: 12px;
    }
  `;
}

class LondonBridgeSongFactory {
  private static readonly ticksPerQuarterNote = 480;

  public static create(): MidiSong {
    const builder = new MidiSongBuilder(
      "london-bridge",
      "London Bridge Is Falling Down",
      105,
      LondonBridgeSongFactory.ticksPerQuarterNote,
    );

    builder.addNote(67, 1);
    builder.addNote(69, 1);
    builder.addNote(67, 1);
    builder.addNote(65, 1);
    builder.addNote(64, 1);
    builder.addNote(65, 1);
    builder.addNote(67, 2);

    builder.addNote(62, 1);
    builder.addNote(64, 1);
    builder.addNote(65, 2);

    builder.addNote(64, 1);
    builder.addNote(65, 1);
    builder.addNote(67, 2);

    builder.addNote(67, 1);
    builder.addNote(69, 1);
    builder.addNote(67, 1);
    builder.addNote(65, 1);
    builder.addNote(64, 1);
    builder.addNote(65, 1);
    builder.addNote(67, 2);

    builder.addNote(62, 2);
    builder.addNote(67, 2);
    builder.addNote(64, 2);
    builder.addNote(60, 2);

    return builder.build();
  }
}

class MidiSongBuilder {
  private readonly events: MidiSong["events"] extends readonly (infer TEvent)[]
    ? TEvent[]
    : never = [];

  private cursorTick = 0;

  public constructor(
    private readonly id: string,
    private readonly title: string,
    private readonly tempoBpm: number,
    private readonly ticksPerQuarterNote: number,
  ) {}

  public addNote(
    note: number,
    durationQuarterNotes: number,
    velocity = 105,
    channel = 0,
  ): void {
    const durationTicks = durationQuarterNotes * this.ticksPerQuarterNote;

    this.events.push({
      tick: this.cursorTick,
      message: {
        kind: MidiMessageKinds.noteOn,
        channel,
        note,
        velocity,
      },
    });

    this.events.push({
      tick: this.cursorTick + durationTicks,
      message: {
        kind: MidiMessageKinds.noteOff,
        channel,
        note,
        velocity: 0,
      },
    });

    this.cursorTick += durationTicks;
  }

  public build(): MidiSong {
    return {
      id: this.id,
      title: this.title,
      tempoBpm: this.tempoBpm,
      ticksPerQuarterNote: this.ticksPerQuarterNote,
      events: this.events,
    };
  }
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
    "midi-controller": MidiControllerComponent;
  }
}
'@

Write-Utf8File `
    -Path $SoundControllerPath `
    -Content @'
import {
  MidiMessageKinds,
  type MidiMessage,
} from "@monorepo/audio-function-midi-streamer-contracts";
import {
  OscillatorKind,
  OscillatorWaveformKind,
  type IBasicOscillatorDefinition,
  type OscillatorDefinition,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";
import {
  WebAudioOscillatorGraphFactory,
  type IWebAudioConnectable,
  type IWebAudioOscillatorGraph,
} from "@monorepo/music-core-synthesizer-oscillators-web-audio";

import { BrowserWebAudioContextAdapter } from "./BrowserWebAudioContextAdapter.js";
import { MidiNoteFrequencyMapper } from "./MidiNoteFrequencyMapper.js";

export type OscillatorIndex = 0 | 1;

export class SoundController {
  private readonly frequencyMapper = new MidiNoteFrequencyMapper();

  private context: AudioContext | null = null;
  private graphFactory: WebAudioOscillatorGraphFactory | null = null;
  private masterGain: GainNode | null = null;
  private activeGraphs: IWebAudioOscillatorGraph[] = [];

  private readonly oscillatorDefinitions: [
    OscillatorDefinition,
    OscillatorDefinition,
  ] = [
    {
      kind: OscillatorKind.Basic,
      waveform: OscillatorWaveformKind.Sawtooth,
      frequencyHz: 440,
      detuneCents: -7,
      phaseRadians: 0,
      gain: 0.45,
    },
    {
      kind: OscillatorKind.Basic,
      waveform: OscillatorWaveformKind.Square,
      frequencyHz: 440,
      detuneCents: 7,
      phaseRadians: 0,
      gain: 0.35,
    },
  ];

  public getOscillatorDefinition(index: OscillatorIndex): OscillatorDefinition {
    return this.oscillatorDefinitions[index];
  }

  public setOscillatorDefinition(
    index: OscillatorIndex,
    definition: OscillatorDefinition,
  ): void {
    this.oscillatorDefinitions[index] = definition;
  }

  public async init(): Promise<void> {
    if (this.context !== null) {
      await this.context.resume();
      return;
    }

    const context = new AudioContext();
    await context.resume();

    const masterGain = context.createGain();
    masterGain.gain.value = 0.75;
    masterGain.connect(context.destination);

    this.context = context;
    this.masterGain = masterGain;
    this.graphFactory = WebAudioOscillatorGraphFactory.createDefault(
      new BrowserWebAudioContextAdapter(context),
    );
  }

  public async handleMidiMessage(message: MidiMessage): Promise<void> {
    await this.init();

    switch (message.kind) {
      case MidiMessageKinds.noteOn:
        if (message.velocity <= 0) {
          this.noteOff();
          return;
        }

        this.noteOn(message.note, message.velocity / 127);
        return;

      case MidiMessageKinds.noteOff:
        this.noteOff();
        return;

      case MidiMessageKinds.controlChange:
      case MidiMessageKinds.pitchBend:
      case MidiMessageKinds.systemExclusive:
        return;
    }
  }

  public noteOn(midiNote: number, velocity: number): void {
    if (this.context === null || this.graphFactory === null || this.masterGain === null) {
      throw new Error("SoundController must be initialized before noteOn.");
    }

    this.noteOff();

    const frequencyHz = this.frequencyMapper.toFrequencyHz(midiNote);

    for (const definition of this.oscillatorDefinitions) {
      const graph = this.graphFactory.create(
        this.withRuntimeFrequency(definition, frequencyHz),
      );

      graph.connect(this.masterGain as unknown as IWebAudioConnectable);
      graph.noteOn({
        timeSeconds: this.context.currentTime,
        frequencyHz,
        velocity,
      });

      this.activeGraphs.push(graph);
    }
  }

  public noteOff(): void {
    if (this.context === null) {
      return;
    }

    const graphs = this.activeGraphs;
    this.activeGraphs = [];

    for (const graph of graphs) {
      graph.noteOff({
        timeSeconds: this.context.currentTime,
      });

      graph.disconnect();
    }
  }

  private withRuntimeFrequency(
    definition: OscillatorDefinition,
    frequencyHz: number,
  ): OscillatorDefinition {
    if (definition.kind !== OscillatorKind.Basic) {
      return definition;
    }

    const basicDefinition: IBasicOscillatorDefinition = {
      ...definition,
      frequencyHz,
    };

    return basicDefinition;
  }
}
'@

Write-Host ""
Write-Host "Done."
Write-Host ""
Write-Host "Run from monorepo root:"
Write-Host "  cd `"C:\Users\danha\source\repos\HTML\MonoRepro`""
Write-Host "  pnpm install"
Write-Host "  pnpm --filter @monorepo/audio-function-midi-streamer-contracts build"
Write-Host "  pnpm --filter @monorepo/audio-function-midi-streamer build"
Write-Host "  pnpm --filter module-basic build"