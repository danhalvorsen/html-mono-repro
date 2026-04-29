
# FILE: refactor-audio-function-midi-streamer-ui-oop-lit3.ps1

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$PackageRoot = "C:\Users\danha\source\repos\HTML\MonoRepro\packages\Audio\project-x-ray-sound-magic\music-core-synthesizer\functional-modules\midi-streamer\audio-function-midi-streamer-ui"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$BackupStamp = Get-Date -Format "yyyyMMdd-HHmmss"

$SrcRoot = Join-Path $PackageRoot "src"
$ComponentsRoot = Join-Path $SrcRoot "components"
$CompositionRoot = Join-Path $SrcRoot "composition"
$ApplicationRoot = Join-Path $SrcRoot "application"
$InfrastructureRoot = Join-Path $SrcRoot "infrastructure"
$InternalRoot = Join-Path $SrcRoot "internal"

$PackageJsonPath = Join-Path $PackageRoot "package.json"
$TsconfigPath = Join-Path $PackageRoot "tsconfig.json"

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
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$Version
    )

    Assert-File -Path $PackageJsonPath

    $json = Get-Content -LiteralPath $PackageJsonPath -Raw | ConvertFrom-Json

    if ($null -eq $json.dependencies) {
        Set-JsonProperty -Object $json -Name "dependencies" -Value ([pscustomobject]@{})
    }

    Set-JsonProperty -Object $json.dependencies -Name $Name -Value $Version

    Backup-File -Path $PackageJsonPath

    [System.IO.File]::WriteAllText(
        $PackageJsonPath,
        (($json | ConvertTo-Json -Depth 100) + [Environment]::NewLine),
        $Utf8NoBom
    )

    Write-Host "Dependency: $Name -> $Version"
}

function Patch-Tsconfig {
    Assert-File -Path $TsconfigPath

    $json = Get-Content -LiteralPath $TsconfigPath -Raw | ConvertFrom-Json

    if ($null -eq $json.compilerOptions) {
        Set-JsonProperty -Object $json -Name "compilerOptions" -Value ([pscustomobject]@{})
    }

    $compilerOptions = $json.compilerOptions

    Set-JsonProperty -Object $compilerOptions -Name "experimentalDecorators" -Value $true
    Set-JsonProperty -Object $compilerOptions -Name "useDefineForClassFields" -Value $false
    Set-JsonProperty -Object $compilerOptions -Name "emitDecoratorMetadata" -Value $false

    $lib = @()

    if (
        $compilerOptions.PSObject.Properties.Name -contains "lib" -and
        $null -ne $compilerOptions.lib
    ) {
        $lib = @($compilerOptions.lib)
    }

    foreach ($item in @("ES2022", "DOM", "DOM.Iterable")) {
        if ($lib -notcontains $item) {
            $lib += $item
        }
    }

    Set-JsonProperty -Object $compilerOptions -Name "lib" -Value @($lib)

    Backup-File -Path $TsconfigPath

    [System.IO.File]::WriteAllText(
        $TsconfigPath,
        (($json | ConvertTo-Json -Depth 100) + [Environment]::NewLine),
        $Utf8NoBom
    )

    Write-Host "Patched:   $TsconfigPath"
}

function Move-ObsoleteFile {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        return
    }

    $relativePath = [System.IO.Path]::GetRelativePath($PackageRoot, $Path)
    $archivePath = Join-Path $PackageRoot ".dead-code\$BackupStamp\$relativePath"
    $archiveDirectory = Split-Path -Parent $archivePath

    if (-not (Test-Path -LiteralPath $archiveDirectory -PathType Container)) {
        New-Item -ItemType Directory -Path $archiveDirectory -Force | Out-Null
    }

    Move-Item -LiteralPath $Path -Destination $archivePath -Force
    Write-Host "Archived obsolete: $relativePath"
}

Assert-Directory -Path $PackageRoot
Assert-Directory -Path $SrcRoot
Assert-File -Path $PackageJsonPath
Assert-File -Path $TsconfigPath

New-Item -ItemType Directory -Path $ComponentsRoot -Force | Out-Null
New-Item -ItemType Directory -Path $CompositionRoot -Force | Out-Null
New-Item -ItemType Directory -Path $ApplicationRoot -Force | Out-Null
New-Item -ItemType Directory -Path $InfrastructureRoot -Force | Out-Null
New-Item -ItemType Directory -Path $InternalRoot -Force | Out-Null

Write-Utf8File `
    -Path (Join-Path $ApplicationRoot "MidiSongCatalogLoader.ts") `
    -Content @'
import type { MidiSong } from "@monorepo/audio-function-midi-streamer-contracts";

export interface ILoadMidiSongCatalogRequest {
  readonly sourceUrl: string;
}

export interface IMidiSongCatalogGateway {
  readJson(sourceUrl: string): Promise<unknown>;
}

export interface IMidiSongCatalogParser {
  parse(value: unknown): readonly MidiSong[];
}

export interface IMidiSongCatalogLoader {
  load(request: ILoadMidiSongCatalogRequest): Promise<readonly MidiSong[]>;
}

export class MidiSongCatalogLoader implements IMidiSongCatalogLoader {
  public constructor(
    private readonly gateway: IMidiSongCatalogGateway,
    private readonly parser: IMidiSongCatalogParser,
  ) {}

  public async load(
    request: ILoadMidiSongCatalogRequest,
  ): Promise<readonly MidiSong[]> {
    const sourceUrl = request.sourceUrl.trim();

    if (sourceUrl.length === 0) {
      return [];
    }

    const json = await this.gateway.readJson(sourceUrl);

    return this.parser.parse(json);
  }
}
'@

Write-Utf8File `
    -Path (Join-Path $ApplicationRoot "MidiStreamerStatusFormatter.ts") `
    -Content @'
import type {
  MidiSong,
  MidiStreamMessage,
} from "@monorepo/audio-function-midi-streamer-contracts";

export interface IMidiStreamerStatusFormatter {
  noSongsLoaded(): string;
  loadingSongs(): string;
  songsLoaded(songCount: number): string;
  selected(song: MidiSong): string;
  selectedSongNotFound(songId: string): string;
  playing(song: MidiSong): string;
  playingEvent(event: MidiStreamMessage, song: MidiSong | null): string;
  completed(): string;
  stopped(): string;
  failed(message: string): string;
  streamerMissing(): string;
}

export class MidiStreamerStatusFormatter implements IMidiStreamerStatusFormatter {
  public noSongsLoaded(): string {
    return "No songs loaded";
  }

  public loadingSongs(): string {
    return "Loading songs...";
  }

  public songsLoaded(songCount: number): string {
    return songCount === 1 ? "1 song loaded" : `${songCount} songs loaded`;
  }

  public selected(song: MidiSong): string {
    return `Selected: ${song.title}`;
  }

  public selectedSongNotFound(songId: string): string {
    return `Selected song not found: ${songId}`;
  }

  public playing(song: MidiSong): string {
    return `Playing: ${song.title}`;
  }

  public playingEvent(event: MidiStreamMessage, song: MidiSong | null): string {
    return `Playing event ${event.eventIndex + 1}/${song?.events.length ?? "?"}`;
  }

  public completed(): string {
    return "Completed";
  }

  public stopped(): string {
    return "Stopped";
  }

  public failed(message: string): string {
    return `Failed: ${message}`;
  }

  public streamerMissing(): string {
    return "No MIDI song streamer has been configured.";
  }
}
'@

Write-Utf8File `
    -Path (Join-Path $ApplicationRoot "MidiStreamerSessionController.ts") `
    -Content @'
import type {
  IMidiSongStreamer,
  IMidiStreamSink,
  MidiSong,
  MidiStreamCompleted,
  MidiStreamFailure,
  MidiStreamMessage,
  MidiStreamSubscription,
} from "@monorepo/audio-function-midi-streamer-contracts";

export interface IMidiStreamerSessionObserver {
  onMidiStreamMessage(event: MidiStreamMessage): void;
  onMidiStreamCompleted(event: MidiStreamCompleted): void;
  onMidiStreamFailed(error: MidiStreamFailure): void;
}

export interface IMidiStreamEventPublisher {
  publishSongsLoaded(target: EventTarget, songCount: number): void;
  publishSongSelected(target: EventTarget, song: MidiSong): void;
  publishStreamFailed(
    target: EventTarget,
    request: IPublishMidiStreamFailureRequest,
  ): void;
  createSink(
    target: EventTarget,
    observer: IMidiStreamerSessionObserver,
  ): IMidiStreamSink;
}

export interface IPublishMidiStreamFailureRequest {
  readonly songId: string;
  readonly message: string;
}

export interface IStartMidiStreamerSessionRequest {
  readonly target: EventTarget;
  readonly streamer: IMidiSongStreamer;
  readonly song: MidiSong;
  readonly observer: IMidiStreamerSessionObserver;
}

export interface IMidiStreamerSessionController {
  readonly isPlaying: boolean;

  start(request: IStartMidiStreamerSessionRequest): void;

  stop(): void;
}

export class MidiStreamerSessionController
  implements IMidiStreamerSessionController {
  private currentSubscription: MidiStreamSubscription | null = null;

  public constructor(
    private readonly eventPublisher: IMidiStreamEventPublisher,
  ) {}

  public get isPlaying(): boolean {
    return this.currentSubscription !== null;
  }

  public start(request: IStartMidiStreamerSessionRequest): void {
    this.stop();

    this.eventPublisher.publishSongSelected(request.target, request.song);

    this.currentSubscription = request.streamer.stream(
      request.song,
      this.eventPublisher.createSink(request.target, request.observer),
    );
  }

  public stop(): void {
    if (this.currentSubscription === null) {
      return;
    }

    this.currentSubscription.cancel();
    this.currentSubscription = null;
  }
}
'@

Write-Utf8File `
    -Path (Join-Path $InfrastructureRoot "FetchMidiSongCatalogGateway.ts") `
    -Content @'
import type { IMidiSongCatalogGateway } from "../application/MidiSongCatalogLoader.js";

export class FetchMidiSongCatalogGateway implements IMidiSongCatalogGateway {
  public async readJson(sourceUrl: string): Promise<unknown> {
    const response = await fetch(sourceUrl);

    if (!response.ok) {
      throw new Error(`Failed to load MIDI songs. HTTP status: ${response.status}.`);
    }

    return response.json() as Promise<unknown>;
  }
}
'@

Write-Utf8File `
    -Path (Join-Path $InfrastructureRoot "DomMidiStreamEventPublisher.ts") `
    -Content @'
import {
  MidiStreamerDomEvents,
  type IMidiStreamSink,
  type MidiSong,
  type MidiStreamCompleted,
  type MidiStreamFailure,
  type MidiStreamMessage,
} from "@monorepo/audio-function-midi-streamer-contracts";

import type {
  IMidiStreamEventPublisher,
  IMidiStreamerSessionObserver,
  IPublishMidiStreamFailureRequest,
} from "../application/MidiStreamerSessionController.js";

export class DomMidiStreamEventPublisher implements IMidiStreamEventPublisher {
  public publishSongsLoaded(target: EventTarget, songCount: number): void {
    this.dispatch(target, MidiStreamerDomEvents.songsLoaded, {
      count: songCount,
    });
  }

  public publishSongSelected(target: EventTarget, song: MidiSong): void {
    this.dispatch(target, MidiStreamerDomEvents.songSelected, {
      songId: song.id,
      title: song.title,
    });
  }

  public publishStreamFailed(
    target: EventTarget,
    request: IPublishMidiStreamFailureRequest,
  ): void {
    this.dispatch(target, MidiStreamerDomEvents.streamFailed, {
      songId: request.songId,
      message: request.message,
    });
  }

  public createSink(
    target: EventTarget,
    observer: IMidiStreamerSessionObserver,
  ): IMidiStreamSink {
    return new DomMidiStreamSink(target, observer);
  }

  private dispatch(target: EventTarget, eventName: string, detail: unknown): void {
    target.dispatchEvent(
      new CustomEvent(eventName, {
        bubbles: true,
        composed: true,
        detail,
      }),
    );
  }
}

class DomMidiStreamSink implements IMidiStreamSink {
  public constructor(
    private readonly target: EventTarget,
    private readonly observer: IMidiStreamerSessionObserver,
  ) {}

  public send(event: MidiStreamMessage): void {
    this.observer.onMidiStreamMessage(event);
    this.dispatch(MidiStreamerDomEvents.midiMessage, event);
  }

  public complete(event: MidiStreamCompleted): void {
    this.observer.onMidiStreamCompleted(event);
    this.dispatch(MidiStreamerDomEvents.streamCompleted, event);
  }

  public fail(error: MidiStreamFailure): void {
    this.observer.onMidiStreamFailed(error);
    this.dispatch(MidiStreamerDomEvents.streamFailed, error);
  }

  private dispatch(eventName: string, detail: unknown): void {
    this.target.dispatchEvent(
      new CustomEvent(eventName, {
        bubbles: true,
        composed: true,
        detail,
      }),
    );
  }
}
'@

Write-Utf8File `
    -Path (Join-Path $InternalRoot "MidiSongCatalogJsonParser.ts") `
    -Content @'
import {
  MidiMessageKinds,
  type MidiMessage,
  type MidiSong,
  type MidiTimedMessage,
} from "@monorepo/audio-function-midi-streamer-contracts";

import type { IMidiSongCatalogParser } from "../application/MidiSongCatalogLoader.js";

export class MidiSongCatalogJsonParser implements IMidiSongCatalogParser {
  public parse(value: unknown): readonly MidiSong[] {
    const songsValue = this.readSongsRoot(value);

    return songsValue.map((songValue, index) => this.readSong(songValue, index));
  }

  private readSongsRoot(value: unknown): readonly unknown[] {
    if (Array.isArray(value)) {
      return value;
    }

    if (this.isRecord(value) && Array.isArray(value["songs"])) {
      return value["songs"];
    }

    throw new TypeError("Expected a MIDI song array or an object with a songs array.");
  }

  private readSong(value: unknown, index: number): MidiSong {
    const record = this.requireRecord(value, `songs[${index}]`);

    return {
      id: this.readString(record, "id", `songs[${index}].id`),
      title: this.readString(record, "title", `songs[${index}].title`),
      tempoBpm: this.readNumber(record, "tempoBpm", `songs[${index}].tempoBpm`),
      ticksPerQuarterNote: this.readNumber(
        record,
        "ticksPerQuarterNote",
        `songs[${index}].ticksPerQuarterNote`,
      ),
      events: this.readEvents(record["events"], `songs[${index}].events`),
    };
  }

  private readEvents(value: unknown, path: string): readonly MidiTimedMessage[] {
    if (!Array.isArray(value)) {
      throw new TypeError(`${path} must be an array.`);
    }

    return value.map((eventValue, index) => {
      const eventRecord = this.requireRecord(eventValue, `${path}[${index}]`);

      return {
        tick: this.readNumber(eventRecord, "tick", `${path}[${index}].tick`),
        message: this.readMessage(eventRecord["message"], `${path}[${index}].message`),
      };
    });
  }

  private readMessage(value: unknown, path: string): MidiMessage {
    const record = this.requireRecord(value, path);
    const kind = this.readString(record, "kind", `${path}.kind`);

    switch (kind) {
      case MidiMessageKinds.noteOn:
        return {
          kind: MidiMessageKinds.noteOn,
          channel: this.readNumber(record, "channel", `${path}.channel`),
          note: this.readNumber(record, "note", `${path}.note`),
          velocity: this.readNumber(record, "velocity", `${path}.velocity`),
        };

      case MidiMessageKinds.noteOff:
        return {
          kind: MidiMessageKinds.noteOff,
          channel: this.readNumber(record, "channel", `${path}.channel`),
          note: this.readNumber(record, "note", `${path}.note`),
          velocity: this.readNumber(record, "velocity", `${path}.velocity`),
        };

      case MidiMessageKinds.controlChange:
        return {
          kind: MidiMessageKinds.controlChange,
          channel: this.readNumber(record, "channel", `${path}.channel`),
          controller: this.readNumber(record, "controller", `${path}.controller`),
          value: this.readNumber(record, "value", `${path}.value`),
        };

      case MidiMessageKinds.pitchBend:
        return {
          kind: MidiMessageKinds.pitchBend,
          channel: this.readNumber(record, "channel", `${path}.channel`),
          value: this.readNumber(record, "value", `${path}.value`),
        };

      case MidiMessageKinds.systemExclusive:
        return {
          kind: MidiMessageKinds.systemExclusive,
          data: this.readNumberArray(record["data"], `${path}.data`),
        };

      default:
        throw new TypeError(`${path}.kind is not a supported MIDI message kind.`);
    }
  }

  private readNumberArray(value: unknown, path: string): readonly number[] {
    if (!Array.isArray(value)) {
      throw new TypeError(`${path} must be a number array.`);
    }

    return value.map((item, index) => {
      if (typeof item !== "number") {
        throw new TypeError(`${path}[${index}] must be a number.`);
      }

      return item;
    });
  }

  private readString(
    record: Readonly<Record<string, unknown>>,
    key: string,
    path: string,
  ): string {
    const value = record[key];

    if (typeof value !== "string" || value.trim().length === 0) {
      throw new TypeError(`${path} must be a non-empty string.`);
    }

    return value;
  }

  private readNumber(
    record: Readonly<Record<string, unknown>>,
    key: string,
    path: string,
  ): number {
    const value = record[key];

    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new TypeError(`${path} must be a finite number.`);
    }

    return value;
  }

  private requireRecord(
    value: unknown,
    path: string,
  ): Readonly<Record<string, unknown>> {
    if (!this.isRecord(value)) {
      throw new TypeError(`${path} must be an object.`);
    }

    return value;
  }

  private isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
}
'@

Write-Utf8File `
    -Path (Join-Path $CompositionRoot "AudioFunctionMidiStreamerUiCompositionRoot.ts") `
    -Content @'
import type {
  IMidiSongCatalogLoader,
} from "../application/MidiSongCatalogLoader.js";
import {
  MidiSongCatalogLoader,
} from "../application/MidiSongCatalogLoader.js";
import type {
  IMidiStreamEventPublisher,
  IMidiStreamerSessionController,
} from "../application/MidiStreamerSessionController.js";
import {
  MidiStreamerSessionController,
} from "../application/MidiStreamerSessionController.js";
import type {
  IMidiStreamerStatusFormatter,
} from "../application/MidiStreamerStatusFormatter.js";
import {
  MidiStreamerStatusFormatter,
} from "../application/MidiStreamerStatusFormatter.js";
import { DomMidiStreamEventPublisher } from "../infrastructure/DomMidiStreamEventPublisher.js";
import { FetchMidiSongCatalogGateway } from "../infrastructure/FetchMidiSongCatalogGateway.js";
import { MidiSongCatalogJsonParser } from "../internal/MidiSongCatalogJsonParser.js";

export interface IAudioFunctionMidiStreamerUiServices {
  readonly catalogLoader: IMidiSongCatalogLoader;
  readonly sessionController: IMidiStreamerSessionController;
  readonly statusFormatter: IMidiStreamerStatusFormatter;
  readonly eventPublisher: IMidiStreamEventPublisher;
}

export class AudioFunctionMidiStreamerUiCompositionRoot {
  public compose(): IAudioFunctionMidiStreamerUiServices {
    const eventPublisher = new DomMidiStreamEventPublisher();

    return {
      catalogLoader: new MidiSongCatalogLoader(
        new FetchMidiSongCatalogGateway(),
        new MidiSongCatalogJsonParser(),
      ),
      sessionController: new MidiStreamerSessionController(eventPublisher),
      statusFormatter: new MidiStreamerStatusFormatter(),
      eventPublisher,
    };
  }
}
'@

Write-Utf8File `
    -Path (Join-Path $ComponentsRoot "AudioFunctionMidiStreamerElement.ts") `
    -Content @'
import type {
  IMidiSongStreamer,
  MidiSong,
  MidiStreamCompleted,
  MidiStreamFailure,
  MidiStreamMessage,
} from "@monorepo/audio-function-midi-streamer-contracts";
import { css, html, LitElement, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

import type {
  IAudioFunctionMidiStreamerUiServices,
} from "../composition/AudioFunctionMidiStreamerUiCompositionRoot.js";
import {
  AudioFunctionMidiStreamerUiCompositionRoot,
} from "../composition/AudioFunctionMidiStreamerUiCompositionRoot.js";

export const AudioFunctionMidiStreamerElementTagName =
  "audio-function-midi-streamer";

@customElement(AudioFunctionMidiStreamerElementTagName)
export class AudioFunctionMidiStreamerElement extends LitElement {
  public static override readonly styles = css`
    :host {
      display: block;
      box-sizing: border-box;
      font-family: system-ui, sans-serif;
    }

    :host([disabled]) {
      opacity: 0.7;
    }

    .root {
      display: grid;
      gap: 0.75rem;
    }

    .field {
      display: grid;
      gap: 0.25rem;
    }

    label {
      font-size: 0.875rem;
      font-weight: 600;
    }

    select {
      min-height: 2rem;
      font: inherit;
    }

    .toolbar {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      align-items: center;
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
      opacity: 0.8;
    }
  `;

  @property({ attribute: false })
  public songs: readonly MidiSong[] = [];

  @property({ type: String, attribute: "song-source-url" })
  public songSourceUrl = "";

  @property({ type: Boolean, reflect: true })
  public disabled = false;

  @property({ attribute: false })
  public streamer: IMidiSongStreamer | null = null;

  @property({ attribute: false })
  public services: IAudioFunctionMidiStreamerUiServices =
    new AudioFunctionMidiStreamerUiCompositionRoot().compose();

  @state()
  private selectedSongId = "";

  @state()
  private isLoading = false;

  @state()
  private isPlaying = false;

  @state()
  private statusText = this.services.statusFormatter.noSongsLoaded();

  private loadVersion = 0;

  public override disconnectedCallback(): void {
    this.loadVersion++;
    this.services.sessionController.stop();
    this.isPlaying = false;
    super.disconnectedCallback();
  }

  protected override updated(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has("disabled") && this.disabled) {
      this.stopCurrentStream(true);
    }

    if (changedProperties.has("songs")) {
      this.syncSelectedSong();
    }

    if (changedProperties.has("songSourceUrl")) {
      void this.loadSongsFromSourceUrl();
    }
  }

  protected override render(): TemplateResult {
    const hasSongs = this.songs.length > 0;
    const canPlay =
      !this.disabled &&
      !this.isLoading &&
      !this.isPlaying &&
      hasSongs;

    return html`
      <section class="root" aria-busy=${String(this.isLoading)}>
        <div class="field">
          <label for="song-selector">Song</label>

          <select
            id="song-selector"
            .value=${this.selectedSongId}
            ?disabled=${this.disabled || this.isLoading || this.isPlaying || !hasSongs}
            @change=${this.handleSongChanged}
          >
            ${repeat(
              this.songs,
              (song) => song.id,
              (song) => html`
                <option value=${song.id}>${song.title}</option>
              `,
            )}
          </select>
        </div>

        <div class="toolbar">
          <button
            type="button"
            ?disabled=${!canPlay}
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

        <div class="status" role="status" aria-live="polite">
          ${this.statusText}
        </div>

        <slot name="midi-data"></slot>
      </section>
    `;
  }

  private async loadSongsFromSourceUrl(): Promise<void> {
    const sourceUrl = this.songSourceUrl.trim();
    const version = ++this.loadVersion;

    if (sourceUrl.length === 0) {
      return;
    }

    this.stopCurrentStream(false);
    this.isLoading = true;
    this.statusText = this.services.statusFormatter.loadingSongs();

    try {
      const songs = await this.services.catalogLoader.load({ sourceUrl });

      if (version !== this.loadVersion) {
        return;
      }

      this.songs = songs;
      this.syncSelectedSong();
      this.statusText = this.services.statusFormatter.songsLoaded(this.songs.length);
      this.services.eventPublisher.publishSongsLoaded(this, this.songs.length);
    } catch (error) {
      if (version === this.loadVersion) {
        this.publishFailure(this.getErrorMessage(error));
      }
    } finally {
      if (version === this.loadVersion) {
        this.isLoading = false;
      }
    }
  }

  private readonly handleSongChanged = (event: Event): void => {
    const target = event.target;

    if (!(target instanceof HTMLSelectElement)) {
      return;
    }

    this.selectedSongId = target.value;

    const selectedSong = this.getSelectedSong();

    this.statusText =
      selectedSong === null
        ? this.services.statusFormatter.selectedSongNotFound(target.value)
        : this.services.statusFormatter.selected(selectedSong);
  };

  private readonly playSelectedSong = (): void => {
    if (this.disabled || this.isLoading || this.isPlaying) {
      return;
    }

    const song = this.getSelectedSong();

    if (song === null) {
      this.publishFailure(
        this.services.statusFormatter.selectedSongNotFound(this.selectedSongId),
      );
      return;
    }

    if (this.streamer === null) {
      this.publishFailure(this.services.statusFormatter.streamerMissing());
      return;
    }

    this.isPlaying = true;
    this.statusText = this.services.statusFormatter.playing(song);

    this.services.sessionController.start({
      target: this,
      streamer: this.streamer,
      song,
      observer: {
        onMidiStreamMessage: (event) => this.onMidiStreamMessage(event),
        onMidiStreamCompleted: (event) => this.onMidiStreamCompleted(event),
        onMidiStreamFailed: (error) => this.onMidiStreamFailed(error),
      },
    });
  };

  private readonly stopByUser = (): void => {
    this.stopCurrentStream(true);
  };

  private onMidiStreamMessage(event: MidiStreamMessage): void {
    this.statusText = this.services.statusFormatter.playingEvent(
      event,
      this.getSelectedSong(),
    );
  }

  private onMidiStreamCompleted(_event: MidiStreamCompleted): void {
    this.isPlaying = false;
    this.statusText = this.services.statusFormatter.completed();
  }

  private onMidiStreamFailed(error: MidiStreamFailure): void {
    this.isPlaying = false;
    this.statusText = this.services.statusFormatter.failed(error.message);
  }

  private stopCurrentStream(updateStatus: boolean): void {
    this.services.sessionController.stop();
    this.isPlaying = false;

    if (updateStatus) {
      this.statusText = this.services.statusFormatter.stopped();
    }
  }

  private syncSelectedSong(): void {
    if (this.songs.length === 0) {
      this.selectedSongId = "";
      this.statusText = this.services.statusFormatter.noSongsLoaded();
      return;
    }

    const selectedStillExists = this.songs.some(
      (song) => song.id === this.selectedSongId,
    );

    if (!selectedStillExists) {
      this.selectedSongId = this.songs[0]?.id ?? "";
    }
  }

  private getSelectedSong(): MidiSong | null {
    return this.songs.find((song) => song.id === this.selectedSongId) ?? null;
  }

  private publishFailure(message: string): void {
    this.stopCurrentStream(false);
    this.statusText = this.services.statusFormatter.failed(message);

    this.services.eventPublisher.publishStreamFailed(this, {
      songId: this.selectedSongId,
      message,
    });
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return "Unknown MIDI streamer error.";
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "audio-function-midi-streamer": AudioFunctionMidiStreamerElement;
  }
}
'@

Write-Utf8File `
    -Path (Join-Path $SrcRoot "index.ts") `
    -Content @'
export * from "./application/MidiSongCatalogLoader.js";
export * from "./application/MidiStreamerSessionController.js";
export * from "./application/MidiStreamerStatusFormatter.js";
export * from "./components/AudioFunctionMidiStreamerElement.js";
export * from "./composition/AudioFunctionMidiStreamerUiCompositionRoot.js";
export * from "./infrastructure/DomMidiStreamEventPublisher.js";
export * from "./infrastructure/FetchMidiSongCatalogGateway.js";
'@

Move-ObsoleteFile -Path (Join-Path $ComponentsRoot "defineAudioFunctionMidiStreamerElement.ts")
Move-ObsoleteFile -Path (Join-Path $InternalRoot "DomMidiStreamSink.ts")

Add-PackageDependency -Name "lit" -Version "^3.3.2"
Add-PackageDependency -Name "@monorepo/audio-function-midi-streamer-contracts" -Version "workspace:*"

Patch-Tsconfig

Write-Host ""
Write-Host "Done."
Write-Host ""
Write-Host "Run from monorepo root:"
Write-Host '  cd "C:\Users\danha\source\repos\HTML\MonoRepro"'
Write-Host "  pnpm --filter @monorepo/audio-function-midi-streamer-ui build"
Write-Host "  pnpm --filter module-basic build"

