
# FILE: create-midi-streamer-feature-modules.ps1

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$MidiStreamerRoot = "C:\Users\danha\source\repos\HTML\MonoRepro\packages\Audio\project-x-ray-sound-magic\music-core-synthesizer\functional-modules\midi-streamer",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$ModuleBasicRoot = "C:\Users\danha\source\repos\HTML\MonoRepro\packages\Audio\project-x-ray-sound-magic\test-playground\modules-basic-tester"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$BackupStamp = Get-Date -Format "yyyyMMdd-HHmmss"

$ContractsRoot = Join-Path $MidiStreamerRoot "audio-function-midi-streamer-contracts"
$CoreRoot = Join-Path $MidiStreamerRoot "audio-function-midi-streamer"
$WebAudioContractsRoot = Join-Path $MidiStreamerRoot "audio-function-midi-streamer-contracts-web-audio"
$UiRoot = Join-Path $MidiStreamerRoot "audio-function-midi-streamer-ui"

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

function Write-CommonTsConfig {
    param(
        [Parameter(Mandatory = $true)][string]$PackageRoot,
        [Parameter(Mandatory = $false)][bool]$IncludeDom = $false,
        [Parameter(Mandatory = $false)][bool]$IncludeDecorators = $false
    )

    $lib = if ($IncludeDom) {
        @'
[
      "ES2022",
      "DOM",
      "DOM.Iterable"
    ]
'@
    } else {
        @'
[
      "ES2022"
    ]
'@
    }

    $decoratorOptions = if ($IncludeDecorators) {
        @'
,
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "emitDecoratorMetadata": false
'@
    } else {
        ""
    }

    Write-Utf8File `
        -Path (Join-Path $PackageRoot "tsconfig.json") `
        -Content @"
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": $lib,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "noImplicitOverride": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true$decoratorOptions
  },
  "include": [
    "src/**/*.ts"
  ],
  "exclude": [
    "dist",
    "node_modules",
    "tests"
  ]
}
"@

    Write-Utf8File `
        -Path (Join-Path $PackageRoot "tsconfig.test.json") `
        -Content @'
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "rootDir": ".",
    "noEmit": true
  },
  "include": [
    "src/**/*.ts",
    "tests/**/*.ts"
  ]
}
'@
}

function Write-VitestConfig {
    param(
        [Parameter(Mandatory = $true)][string]$PackageRoot,
        [Parameter(Mandatory = $false)][string]$Environment = "node"
    )

    Write-Utf8File `
        -Path (Join-Path $PackageRoot "vitest.config.ts") `
        -Content @"
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "$Environment",
    include: [
      "tests/**/*.test.ts",
      "tests/**/*.spec.ts"
    ],
    isolate: false,
    pool: "threads",
    typecheck: {
      tsconfig: "./tsconfig.test.json"
    }
  }
});
"@
}

function Write-PackageJson {
    param(
        [Parameter(Mandatory = $true)][string]$PackageRoot,
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$DependenciesJson,
        [Parameter(Mandatory = $false)][string]$ExtraDevDependenciesJson = "",
        [Parameter(Mandatory = $false)][string]$FilesJson = '[
    "dist"
  ]'
    )

    $devDependencies = if ($ExtraDevDependenciesJson.Trim().Length -eq 0) {
        @'
{
    "chai": "^5.1.2",
    "rimraf": "^6.0.1",
    "typescript": "^5.9.3",
    "vitest": "^3.2.4"
  }
'@
    } else {
        $ExtraDevDependenciesJson
    }

    Write-Utf8File `
        -Path (Join-Path $PackageRoot "package.json") `
        -Content @"
{
  "name": "$Name",
  "version": "1.0.0",
  "description": "",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": $FilesJson,
  "scripts": {
    "clean": "rimraf dist",
    "build": "tsc -p tsconfig.json",
    "test": "vitest run",
    "test:typecheck": "vitest run --typecheck"
  },
  "keywords": [
    "audio",
    "midi",
    "streamer",
    "synthesizer"
  ],
  "license": "MIT",
  "dependencies": $DependenciesJson,
  "devDependencies": $devDependencies
}
"@
}

New-Item -ItemType Directory -Path $MidiStreamerRoot -Force | Out-Null
New-Item -ItemType Directory -Path $ContractsRoot -Force | Out-Null
New-Item -ItemType Directory -Path $CoreRoot -Force | Out-Null
New-Item -ItemType Directory -Path $WebAudioContractsRoot -Force | Out-Null
New-Item -ItemType Directory -Path $UiRoot -Force | Out-Null

$SampleSongsJson = @'
{
  "songs": [
    {
      "id": "london-bridge",
      "title": "London Bridge",
      "tempoBpm": 120,
      "ticksPerQuarterNote": 480,
      "events": [
        {
          "tick": 0,
          "message": {
            "kind": "note-on",
            "channel": 0,
            "note": 67,
            "velocity": 100
          }
        },
        {
          "tick": 480,
          "message": {
            "kind": "note-off",
            "channel": 0,
            "note": 67,
            "velocity": 0
          }
        },
        {
          "tick": 480,
          "message": {
            "kind": "note-on",
            "channel": 0,
            "note": 65,
            "velocity": 100
          }
        },
        {
          "tick": 960,
          "message": {
            "kind": "note-off",
            "channel": 0,
            "note": 65,
            "velocity": 0
          }
        }
      ]
    }
  ]
}
'@

Write-Utf8File -Path (Join-Path $MidiStreamerRoot "sample-songs\midi-songs.json") -Content $SampleSongsJson
Write-Utf8File -Path (Join-Path $CoreRoot "sample-songs\midi-songs.json") -Content $SampleSongsJson

if (Test-Path -LiteralPath $ModuleBasicRoot -PathType Container) {
    Write-Utf8File -Path (Join-Path $ModuleBasicRoot "public\midi-songs\midi-songs.json") -Content $SampleSongsJson
}

Write-PackageJson `
    -PackageRoot $ContractsRoot `
    -Name "@monorepo/audio-function-midi-streamer-contracts" `
    -DependenciesJson "{}"

Write-CommonTsConfig -PackageRoot $ContractsRoot
Write-VitestConfig -PackageRoot $ContractsRoot

Write-Utf8File `
    -Path (Join-Path $ContractsRoot "src\constants\MidiMessageKinds.ts") `
    -Content @'
export const MidiMessageKinds = {
  noteOn: "note-on",
  noteOff: "note-off",
  controlChange: "control-change",
  pitchBend: "pitch-bend",
  systemExclusive: "system-exclusive",
} as const;

export type MidiMessageKind =
  (typeof MidiMessageKinds)[keyof typeof MidiMessageKinds];
'@

Write-Utf8File `
    -Path (Join-Path $ContractsRoot "src\constants\MidiStreamerDomEvents.ts") `
    -Content @'
export const MidiStreamerDomEvents = {
  songsLoaded: "audio-function-midi-streamer:songs-loaded",
  songSelected: "audio-function-midi-streamer:song-selected",
  midiMessage: "audio-function-midi-streamer:midi-message",
  streamCompleted: "audio-function-midi-streamer:stream-completed",
  streamFailed: "audio-function-midi-streamer:stream-failed",
} as const;

export type MidiStreamerDomEventName =
  (typeof MidiStreamerDomEvents)[keyof typeof MidiStreamerDomEvents];
'@

Write-Utf8File `
    -Path (Join-Path $ContractsRoot "src\model\MidiMessage.ts") `
    -Content @'
import { MidiMessageKinds } from "../constants/MidiMessageKinds.js";

export type MidiChannel = number;
export type MidiByte = number;
export type MidiNoteNumber = number;
export type MidiVelocity = number;
export type MidiControllerNumber = number;
export type MidiTick = number;

export type MidiMessage =
  | MidiNoteOnMessage
  | MidiNoteOffMessage
  | MidiControlChangeMessage
  | MidiPitchBendMessage
  | MidiSystemExclusiveMessage;

export interface MidiNoteOnMessage {
  readonly kind: typeof MidiMessageKinds.noteOn;
  readonly channel: MidiChannel;
  readonly note: MidiNoteNumber;
  readonly velocity: MidiVelocity;
}

export interface MidiNoteOffMessage {
  readonly kind: typeof MidiMessageKinds.noteOff;
  readonly channel: MidiChannel;
  readonly note: MidiNoteNumber;
  readonly velocity: MidiVelocity;
}

export interface MidiControlChangeMessage {
  readonly kind: typeof MidiMessageKinds.controlChange;
  readonly channel: MidiChannel;
  readonly controller: MidiControllerNumber;
  readonly value: MidiByte;
}

export interface MidiPitchBendMessage {
  readonly kind: typeof MidiMessageKinds.pitchBend;
  readonly channel: MidiChannel;
  readonly value: number;
}

export interface MidiSystemExclusiveMessage {
  readonly kind: typeof MidiMessageKinds.systemExclusive;
  readonly data: readonly MidiByte[];
}
'@

Write-Utf8File `
    -Path (Join-Path $ContractsRoot "src\model\MidiSong.ts") `
    -Content @'
import type { MidiMessage, MidiTick } from "./MidiMessage.js";

export type MidiSongId = string;

export interface MidiTimedMessage {
  readonly tick: MidiTick;
  readonly message: MidiMessage;
}

export interface MidiSong {
  readonly id: MidiSongId;
  readonly title: string;
  readonly tempoBpm: number;
  readonly ticksPerQuarterNote: number;
  readonly events: readonly MidiTimedMessage[];
}
'@

Write-Utf8File `
    -Path (Join-Path $ContractsRoot "src\ports\IMidiStreamScheduler.ts") `
    -Content @'
export interface MidiStreamSubscription {
  cancel(): void;
}

export interface IMidiStreamScheduler {
  schedule(delayMs: number, action: () => void): MidiStreamSubscription;
}
'@

Write-Utf8File `
    -Path (Join-Path $ContractsRoot "src\ports\IMidiStreamSink.ts") `
    -Content @'
import type { MidiMessage } from "../model/MidiMessage.js";
import type { MidiSongId } from "../model/MidiSong.js";

export interface MidiStreamMessage {
  readonly songId: MidiSongId;
  readonly eventIndex: number;
  readonly tick: number;
  readonly delayMs: number;
  readonly message: MidiMessage;
}

export interface MidiStreamCompleted {
  readonly songId: MidiSongId;
  readonly eventCount: number;
}

export interface MidiStreamFailure {
  readonly songId: MidiSongId;
  readonly message: string;
}

export interface IMidiStreamSink {
  send(event: MidiStreamMessage): void;
  complete(event: MidiStreamCompleted): void;
  fail(error: MidiStreamFailure): void;
}
'@

Write-Utf8File `
    -Path (Join-Path $ContractsRoot "src\ports\IMidiSongStreamer.ts") `
    -Content @'
import type { MidiSong } from "../model/MidiSong.js";
import type { IMidiStreamSink } from "./IMidiStreamSink.js";
import type { MidiStreamSubscription } from "./IMidiStreamScheduler.js";

export interface IMidiSongStreamer {
  stream(song: MidiSong, sink: IMidiStreamSink): MidiStreamSubscription;
}
'@

Write-Utf8File `
    -Path (Join-Path $ContractsRoot "src\ports\IMidiSongCatalogRepository.ts") `
    -Content @'
import type { MidiSong, MidiSongId } from "../model/MidiSong.js";

export interface IMidiSongCatalogRepository {
  list(): Promise<readonly MidiSong[]>;
  findById(songId: MidiSongId): Promise<MidiSong | null>;
}

export interface IMidiSongCatalogJsonParser {
  parse(value: unknown): readonly MidiSong[];
}
'@

Write-Utf8File `
    -Path (Join-Path $ContractsRoot "src\index.ts") `
    -Content @'
export * from "./constants/MidiMessageKinds.js";
export * from "./constants/MidiStreamerDomEvents.js";
export * from "./model/MidiMessage.js";
export * from "./model/MidiSong.js";
export * from "./ports/IMidiSongCatalogRepository.js";
export * from "./ports/IMidiSongStreamer.js";
export * from "./ports/IMidiStreamScheduler.js";
export * from "./ports/IMidiStreamSink.js";
'@

Write-Utf8File `
    -Path (Join-Path $ContractsRoot "tests\MidiContracts.test.ts") `
    -Content @'
import { describe, it } from "vitest";
import { should } from "chai";
import { MidiMessageKinds, MidiStreamerDomEvents } from "../src/index.js";

should();

describe("MIDI streamer contracts", () => {
  it("should expose stable MIDI message kinds", () => {
    MidiMessageKinds.noteOn.should.equal("note-on");
    MidiMessageKinds.noteOff.should.equal("note-off");
    MidiMessageKinds.controlChange.should.equal("control-change");
  });

  it("should expose stable DOM event names", () => {
    MidiStreamerDomEvents.midiMessage.should.equal(
      "audio-function-midi-streamer:midi-message",
    );
  });
});
'@

Write-PackageJson `
    -PackageRoot $CoreRoot `
    -Name "@monorepo/audio-function-midi-streamer" `
    -DependenciesJson @'
{
    "@monorepo/audio-function-midi-streamer-contracts": "workspace:*"
  }
'@ `
    -FilesJson @'
[
    "dist",
    "sample-songs"
  ]
'@

Write-CommonTsConfig -PackageRoot $CoreRoot -IncludeDom $true
Write-VitestConfig -PackageRoot $CoreRoot

Write-Utf8File `
    -Path (Join-Path $CoreRoot "src\domain\MidiSongValidationError.ts") `
    -Content @'
export class MidiSongValidationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "MidiSongValidationError";
  }
}
'@

Write-Utf8File `
    -Path (Join-Path $CoreRoot "src\domain\MidiSongValidator.ts") `
    -Content @'
import {
  MidiMessageKinds,
  type MidiMessage,
  type MidiSong,
} from "@monorepo/audio-function-midi-streamer-contracts";
import { MidiSongValidationError } from "./MidiSongValidationError.js";

export class MidiSongValidator {
  public validate(song: MidiSong): void {
    this.requireNonEmptyText(song.id, "song.id");
    this.requireNonEmptyText(song.title, "song.title");
    this.requirePositiveNumber(song.tempoBpm, "song.tempoBpm");
    this.requirePositiveInteger(song.ticksPerQuarterNote, "song.ticksPerQuarterNote");

    if (song.events.length === 0) {
      throw new MidiSongValidationError("song.events must contain at least one MIDI event.");
    }

    for (const [index, event] of song.events.entries()) {
      this.requireNonNegativeInteger(event.tick, `song.events[${index}].tick`);
      this.validateMessage(event.message, `song.events[${index}].message`);
    }
  }

  private validateMessage(message: MidiMessage, path: string): void {
    switch (message.kind) {
      case MidiMessageKinds.noteOn:
        this.requireMidiChannel(message.channel, `${path}.channel`);
        this.requireMidiByte(message.note, `${path}.note`);
        this.requireMidiByte(message.velocity, `${path}.velocity`);
        return;

      case MidiMessageKinds.noteOff:
        this.requireMidiChannel(message.channel, `${path}.channel`);
        this.requireMidiByte(message.note, `${path}.note`);
        this.requireMidiByte(message.velocity, `${path}.velocity`);
        return;

      case MidiMessageKinds.controlChange:
        this.requireMidiChannel(message.channel, `${path}.channel`);
        this.requireMidiByte(message.controller, `${path}.controller`);
        this.requireMidiByte(message.value, `${path}.value`);
        return;

      case MidiMessageKinds.pitchBend:
        this.requireMidiChannel(message.channel, `${path}.channel`);
        this.requireIntegerRange(message.value, -8192, 8191, `${path}.value`);
        return;

      case MidiMessageKinds.systemExclusive:
        for (const [index, value] of message.data.entries()) {
          this.requireMidiByte(value, `${path}.data[${index}]`);
        }
        return;
    }
  }

  private requireNonEmptyText(value: string, path: string): void {
    if (value.trim().length === 0) {
      throw new MidiSongValidationError(`${path} must be non-empty.`);
    }
  }

  private requirePositiveNumber(value: number, path: string): void {
    if (!Number.isFinite(value) || value <= 0) {
      throw new MidiSongValidationError(`${path} must be a positive number.`);
    }
  }

  private requirePositiveInteger(value: number, path: string): void {
    if (!Number.isInteger(value) || value <= 0) {
      throw new MidiSongValidationError(`${path} must be a positive integer.`);
    }
  }

  private requireNonNegativeInteger(value: number, path: string): void {
    if (!Number.isInteger(value) || value < 0) {
      throw new MidiSongValidationError(`${path} must be a non-negative integer.`);
    }
  }

  private requireMidiChannel(value: number, path: string): void {
    this.requireIntegerRange(value, 0, 15, path);
  }

  private requireMidiByte(value: number, path: string): void {
    this.requireIntegerRange(value, 0, 127, path);
  }

  private requireIntegerRange(
    value: number,
    minimum: number,
    maximum: number,
    path: string,
  ): void {
    if (!Number.isInteger(value) || value < minimum || value > maximum) {
      throw new MidiSongValidationError(
        `${path} must be an integer in range ${minimum}..${maximum}.`,
      );
    }
  }
}
'@

Write-Utf8File `
    -Path (Join-Path $CoreRoot "src\application\MidiSongStreamer.ts") `
    -Content @'
import type {
  IMidiSongStreamer,
  IMidiStreamScheduler,
  IMidiStreamSink,
  MidiSong,
  MidiStreamSubscription,
  MidiTimedMessage,
} from "@monorepo/audio-function-midi-streamer-contracts";
import { MidiSongValidator } from "../domain/MidiSongValidator.js";

export class MidiSongStreamer implements IMidiSongStreamer {
  public constructor(
    private readonly scheduler: IMidiStreamScheduler,
    private readonly validator: MidiSongValidator,
  ) {}

  public stream(song: MidiSong, sink: IMidiStreamSink): MidiStreamSubscription {
    this.validator.validate(song);

    const scheduledSubscriptions: MidiStreamSubscription[] = [];
    const orderedEvents = this.orderEvents(song.events);
    const playback = new CompositeMidiStreamSubscription(scheduledSubscriptions);

    for (const [index, event] of orderedEvents.entries()) {
      const delayMs = this.convertTickToDelayMs(event.tick, song);

      scheduledSubscriptions.push(
        this.scheduler.schedule(delayMs, () => {
          if (playback.isCancelled()) {
            return;
          }

          sink.send({
            songId: song.id,
            eventIndex: index,
            tick: event.tick,
            delayMs,
            message: event.message,
          });
        }),
      );
    }

    const lastEvent = orderedEvents[orderedEvents.length - 1];

    if (lastEvent === undefined) {
      return playback;
    }

    const completionDelayMs = this.convertTickToDelayMs(lastEvent.tick + 1, song);

    scheduledSubscriptions.push(
      this.scheduler.schedule(completionDelayMs, () => {
        if (playback.isCancelled()) {
          return;
        }

        sink.complete({
          songId: song.id,
          eventCount: orderedEvents.length,
        });
      }),
    );

    return playback;
  }

  private orderEvents(events: readonly MidiTimedMessage[]): readonly MidiTimedMessage[] {
    return [...events].sort((left, right) => left.tick - right.tick);
  }

  private convertTickToDelayMs(tick: number, song: MidiSong): number {
    const quarterNotes = tick / song.ticksPerQuarterNote;
    const millisecondsPerQuarterNote = 60_000 / song.tempoBpm;

    return quarterNotes * millisecondsPerQuarterNote;
  }
}

class CompositeMidiStreamSubscription implements MidiStreamSubscription {
  private cancelled = false;

  public constructor(
    private readonly subscriptions: readonly MidiStreamSubscription[],
  ) {}

  public cancel(): void {
    if (this.cancelled) {
      return;
    }

    this.cancelled = true;

    for (const subscription of this.subscriptions) {
      subscription.cancel();
    }
  }

  public isCancelled(): boolean {
    return this.cancelled;
  }
}
'@

Write-Utf8File `
    -Path (Join-Path $CoreRoot "src\infrastructure\TimeoutMidiStreamScheduler.ts") `
    -Content @'
import type {
  IMidiStreamScheduler,
  MidiStreamSubscription,
} from "@monorepo/audio-function-midi-streamer-contracts";

export class TimeoutMidiStreamScheduler implements IMidiStreamScheduler {
  public schedule(delayMs: number, action: () => void): MidiStreamSubscription {
    if (!Number.isFinite(delayMs) || delayMs < 0) {
      throw new RangeError("delayMs must be a non-negative finite number.");
    }

    const timeout = setTimeout(action, delayMs);

    return {
      cancel: (): void => {
        clearTimeout(timeout);
      },
    };
  }
}
'@

Write-Utf8File `
    -Path (Join-Path $CoreRoot "src\infrastructure\JsonMidiSongCatalogParser.ts") `
    -Content @'
import {
  MidiMessageKinds,
  type IMidiSongCatalogJsonParser,
  type MidiMessage,
  type MidiSong,
  type MidiTimedMessage,
} from "@monorepo/audio-function-midi-streamer-contracts";

export class JsonMidiSongCatalogParser implements IMidiSongCatalogJsonParser {
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
    const path = `songs[${index}]`;
    const record = this.requireRecord(value, path);

    return {
      id: this.readString(record, "id", `${path}.id`),
      title: this.readString(record, "title", `${path}.title`),
      tempoBpm: this.readNumber(record, "tempoBpm", `${path}.tempoBpm`),
      ticksPerQuarterNote: this.readNumber(
        record,
        "ticksPerQuarterNote",
        `${path}.ticksPerQuarterNote`,
      ),
      events: this.readEvents(record["events"], `${path}.events`),
    };
  }

  private readEvents(value: unknown, path: string): readonly MidiTimedMessage[] {
    if (!Array.isArray(value)) {
      throw new TypeError(`${path} must be an array.`);
    }

    return value.map((eventValue, index) => {
      const eventPath = `${path}[${index}]`;
      const eventRecord = this.requireRecord(eventValue, eventPath);

      return {
        tick: this.readNumber(eventRecord, "tick", `${eventPath}.tick`),
        message: this.readMessage(eventRecord["message"], `${eventPath}.message`),
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
      if (typeof item !== "number" || !Number.isFinite(item)) {
        throw new TypeError(`${path}[${index}] must be a finite number.`);
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
    -Path (Join-Path $CoreRoot "src\infrastructure\InMemoryMidiSongCatalogRepository.ts") `
    -Content @'
import {
  MidiMessageKinds,
  type IMidiSongCatalogRepository,
  type MidiMessage,
  type MidiSong,
  type MidiSongId,
  type MidiTimedMessage,
} from "@monorepo/audio-function-midi-streamer-contracts";
import { MidiSongValidationError } from "../domain/MidiSongValidationError.js";
import { MidiSongValidator } from "../domain/MidiSongValidator.js";

export class InMemoryMidiSongCatalogRepository
  implements IMidiSongCatalogRepository {
  private readonly songs: readonly MidiSong[];
  private readonly songsById: ReadonlyMap<MidiSongId, MidiSong>;

  public constructor(
    songs: readonly MidiSong[],
    validator: MidiSongValidator,
  ) {
    const clonedSongs = songs.map((song) => this.cloneSong(song));
    const map = new Map<MidiSongId, MidiSong>();

    for (const song of clonedSongs) {
      validator.validate(song);

      if (map.has(song.id)) {
        throw new MidiSongValidationError(`Duplicate MIDI song id: ${song.id}.`);
      }

      map.set(song.id, song);
    }

    this.songs = Object.freeze(clonedSongs);
    this.songsById = map;
  }

  public async list(): Promise<readonly MidiSong[]> {
    return this.songs;
  }

  public async findById(songId: MidiSongId): Promise<MidiSong | null> {
    return this.songsById.get(songId) ?? null;
  }

  private cloneSong(song: MidiSong): MidiSong {
    return Object.freeze({
      id: song.id,
      title: song.title,
      tempoBpm: song.tempoBpm,
      ticksPerQuarterNote: song.ticksPerQuarterNote,
      events: Object.freeze(song.events.map((event) => this.cloneEvent(event))),
    });
  }

  private cloneEvent(event: MidiTimedMessage): MidiTimedMessage {
    return Object.freeze({
      tick: event.tick,
      message: this.cloneMessage(event.message),
    });
  }

  private cloneMessage(message: MidiMessage): MidiMessage {
    switch (message.kind) {
      case MidiMessageKinds.noteOn:
        return Object.freeze({ ...message });

      case MidiMessageKinds.noteOff:
        return Object.freeze({ ...message });

      case MidiMessageKinds.controlChange:
        return Object.freeze({ ...message });

      case MidiMessageKinds.pitchBend:
        return Object.freeze({ ...message });

      case MidiMessageKinds.systemExclusive:
        return Object.freeze({
          kind: message.kind,
          data: Object.freeze([...message.data]),
        });
    }
  }
}
'@

Write-Utf8File `
    -Path (Join-Path $CoreRoot "src\composition\MidiSongStreamerFactory.ts") `
    -Content @'
import { MidiSongStreamer } from "../application/MidiSongStreamer.js";
import { MidiSongValidator } from "../domain/MidiSongValidator.js";
import { TimeoutMidiStreamScheduler } from "../infrastructure/TimeoutMidiStreamScheduler.js";

export class MidiSongStreamerFactory {
  public createDefault(): MidiSongStreamer {
    return this.createBrowserDefault();
  }

  public createBrowserDefault(): MidiSongStreamer {
    return new MidiSongStreamer(
      new TimeoutMidiStreamScheduler(),
      new MidiSongValidator(),
    );
  }
}
'@

Write-Utf8File `
    -Path (Join-Path $CoreRoot "src\composition\DefaultMidiSongCatalogFactory.ts") `
    -Content @'
import type {
  IMidiSongCatalogJsonParser,
  IMidiSongCatalogRepository,
  MidiSong,
} from "@monorepo/audio-function-midi-streamer-contracts";
import { MidiSongValidator } from "../domain/MidiSongValidator.js";
import { InMemoryMidiSongCatalogRepository } from "../infrastructure/InMemoryMidiSongCatalogRepository.js";
import { JsonMidiSongCatalogParser } from "../infrastructure\JsonMidiSongCatalogParser.js";

export class DefaultMidiSongCatalogFactory {
  public constructor(
    private readonly parser: IMidiSongCatalogJsonParser = new JsonMidiSongCatalogParser(),
    private readonly validator: MidiSongValidator = new MidiSongValidator(),
  ) {}

  public createFromJson(value: unknown): IMidiSongCatalogRepository {
    return this.createFromSongs(this.parser.parse(value));
  }

  public createFromSongs(
    songs: readonly MidiSong[],
  ): IMidiSongCatalogRepository {
    return new InMemoryMidiSongCatalogRepository(songs, this.validator);
  }
}
'@

Write-Utf8File `
    -Path (Join-Path $CoreRoot "src\index.ts") `
    -Content @'
export * from "./application/MidiSongStreamer.js";
export * from "./composition/DefaultMidiSongCatalogFactory.js";
export * from "./composition/MidiSongStreamerFactory.js";
export * from "./domain/MidiSongValidationError.js";
export * from "./domain/MidiSongValidator.js";
export * from "./infrastructure/InMemoryMidiSongCatalogRepository.js";
export * from "./infrastructure/JsonMidiSongCatalogParser.js";
export * from "./infrastructure/TimeoutMidiStreamScheduler.js";
'@

Write-Utf8File `
    -Path (Join-Path $CoreRoot "tests\JsonMidiSongCatalogParser.test.ts") `
    -Content @'
import { describe, it } from "vitest";
import { should } from "chai";
import { MidiMessageKinds } from "@monorepo/audio-function-midi-streamer-contracts";
import { JsonMidiSongCatalogParser } from "../src/infrastructure/JsonMidiSongCatalogParser.js";

should();

describe("JsonMidiSongCatalogParser", () => {
  it("should parse a MIDI song catalog object", () => {
    const parser = new JsonMidiSongCatalogParser();

    const songs = parser.parse({
      songs: [
        {
          id: "london-bridge",
          title: "London Bridge",
          tempoBpm: 120,
          ticksPerQuarterNote: 480,
          events: [
            {
              tick: 0,
              message: {
                kind: MidiMessageKinds.noteOn,
                channel: 0,
                note: 67,
                velocity: 100,
              },
            },
          ],
        },
      ],
    });

    songs.should.have.length(1);
    songs[0]?.id.should.equal("london-bridge");
  });

  it("should reject invalid MIDI song catalog payloads", () => {
    const parser = new JsonMidiSongCatalogParser();

    (() => parser.parse({ songs: "not-array" })).should.throw(TypeError);
  });
});
'@

Write-Utf8File `
    -Path (Join-Path $CoreRoot "tests\MidiSongStreamer.test.ts") `
    -Content @'
import { describe, it } from "vitest";
import { should } from "chai";
import {
  MidiMessageKinds,
  type IMidiStreamScheduler,
  type IMidiStreamSink,
  type MidiSong,
  type MidiStreamCompleted,
  type MidiStreamFailure,
  type MidiStreamMessage,
  type MidiStreamSubscription,
} from "@monorepo/audio-function-midi-streamer-contracts";
import { MidiSongStreamer } from "../src/application/MidiSongStreamer.js";
import { MidiSongValidator } from "../src/domain/MidiSongValidator.js";

should();

describe("MidiSongStreamer", () => {
  it("should schedule MIDI messages in tick order", () => {
    const fixture = new MidiSongStreamerFixture();

    fixture.stream(fixture.createSongWithUnorderedEvents());
    fixture.scheduler.runAll();

    fixture.sink.messages.map((event) => event.message).should.deep.equal([
      {
        kind: MidiMessageKinds.noteOn,
        channel: 0,
        note: 60,
        velocity: 100,
      },
      {
        kind: MidiMessageKinds.noteOff,
        channel: 0,
        note: 60,
        velocity: 0,
      },
    ]);

    fixture.sink.completed.should.deep.equal({
      songId: "test-song",
      eventCount: 2,
    });
  });

  it("should cancel scheduled MIDI messages when subscription is cancelled", () => {
    const fixture = new MidiSongStreamerFixture();

    const subscription = fixture.stream(fixture.createSongWithUnorderedEvents());
    subscription.cancel();
    fixture.scheduler.runAll();

    fixture.sink.messages.should.deep.equal([]);
  });
});

class MidiSongStreamerFixture {
  public readonly scheduler = new ManualMidiStreamScheduler();
  public readonly sink = new RecordingMidiStreamSink();

  private readonly streamer = new MidiSongStreamer(
    this.scheduler,
    new MidiSongValidator(),
  );

  public stream(song: MidiSong): MidiStreamSubscription {
    return this.streamer.stream(song, this.sink);
  }

  public createSongWithUnorderedEvents(): MidiSong {
    return {
      id: "test-song",
      title: "Test Song",
      tempoBpm: 120,
      ticksPerQuarterNote: 480,
      events: [
        {
          tick: 480,
          message: {
            kind: MidiMessageKinds.noteOff,
            channel: 0,
            note: 60,
            velocity: 0,
          },
        },
        {
          tick: 0,
          message: {
            kind: MidiMessageKinds.noteOn,
            channel: 0,
            note: 60,
            velocity: 100,
          },
        },
      ],
    };
  }
}

interface ScheduledAction {
  readonly delayMs: number;
  readonly sequence: number;
  readonly action: () => void;
  cancelled: boolean;
}

class ManualMidiStreamScheduler implements IMidiStreamScheduler {
  private nextSequence = 0;
  private readonly actions: ScheduledAction[] = [];

  public schedule(delayMs: number, action: () => void): MidiStreamSubscription {
    const scheduled: ScheduledAction = {
      delayMs,
      sequence: this.nextSequence,
      action,
      cancelled: false,
    };

    this.nextSequence += 1;
    this.actions.push(scheduled);

    return {
      cancel: (): void => {
        scheduled.cancelled = true;
      },
    };
  }

  public runAll(): void {
    const orderedActions = [...this.actions].sort((left, right) => {
      if (left.delayMs === right.delayMs) {
        return left.sequence - right.sequence;
      }

      return left.delayMs - right.delayMs;
    });

    for (const scheduled of orderedActions) {
      if (!scheduled.cancelled) {
        scheduled.action();
      }
    }
  }
}

class RecordingMidiStreamSink implements IMidiStreamSink {
  public readonly messages: MidiStreamMessage[] = [];
  public completed: MidiStreamCompleted | undefined = undefined;
  public failure: MidiStreamFailure | undefined = undefined;

  public send(event: MidiStreamMessage): void {
    this.messages.push(event);
  }

  public complete(event: MidiStreamCompleted): void {
    this.completed = event;
  }

  public fail(error: MidiStreamFailure): void {
    this.failure = error;
  }
}
'@

Write-PackageJson `
    -PackageRoot $WebAudioContractsRoot `
    -Name "@monorepo/audio-function-midi-streamer-contracts-web-audio" `
    -DependenciesJson @'
{
    "@monorepo/audio-function-midi-streamer-contracts": "workspace:*"
  }
'@

Write-CommonTsConfig -PackageRoot $WebAudioContractsRoot -IncludeDom $true
Write-VitestConfig -PackageRoot $WebAudioContractsRoot

Write-Utf8File `
    -Path (Join-Path $WebAudioContractsRoot "src\ports\IWebAudioMidiStreamSinkFactory.ts") `
    -Content @'
import type { IMidiStreamSink } from "@monorepo/audio-function-midi-streamer-contracts";

export interface IWebAudioMidiStreamSinkFactory {
  create(request: IWebAudioMidiStreamSinkFactoryRequest): IMidiStreamSink;
}

export interface IWebAudioMidiStreamSinkFactoryRequest {
  readonly context: AudioContext;
  readonly output: AudioNode;
}
'@

Write-Utf8File `
    -Path (Join-Path $WebAudioContractsRoot "src\index.ts") `
    -Content @'
export * from "./ports/IWebAudioMidiStreamSinkFactory.js";
'@

Write-Utf8File `
    -Path (Join-Path $WebAudioContractsRoot "tests\WebAudioContracts.test.ts") `
    -Content @'
import { describe, it } from "vitest";
import { should } from "chai";

should();

describe("Web Audio MIDI streamer contracts", () => {
  it("should load the contract package", async () => {
    const module = await import("../src/index.js");

    Object.keys(module).should.deep.equal([]);
  });
});
'@

Write-PackageJson `
    -PackageRoot $UiRoot `
    -Name "@monorepo/audio-function-midi-streamer-ui" `
    -DependenciesJson @'
{
    "@monorepo/audio-function-midi-streamer-contracts": "workspace:*",
    "lit": "^3.3.2"
  }
'@ `
    -ExtraDevDependenciesJson @'
{
    "chai": "^5.1.2",
    "jsdom": "^25.0.1",
    "rimraf": "^6.0.1",
    "typescript": "^5.9.3",
    "vitest": "^3.2.4"
  }
'@

Write-CommonTsConfig -PackageRoot $UiRoot -IncludeDom $true -IncludeDecorators $true
Write-VitestConfig -PackageRoot $UiRoot -Environment "jsdom"

Write-Utf8File `
    -Path (Join-Path $UiRoot "src\internal\DomMidiStreamSink.ts") `
    -Content @'
import {
  MidiStreamerDomEvents,
  type IMidiStreamSink,
  type MidiStreamCompleted,
  type MidiStreamFailure,
  type MidiStreamMessage,
} from "@monorepo/audio-function-midi-streamer-contracts";

export interface IDomMidiStreamSinkObserver {
  onMidiStreamMessage(event: MidiStreamMessage): void;
  onMidiStreamCompleted(event: MidiStreamCompleted): void;
  onMidiStreamFailed(error: MidiStreamFailure): void;
}

export class DomMidiStreamSink implements IMidiStreamSink {
  public constructor(
    private readonly target: EventTarget,
    private readonly observer: IDomMidiStreamSinkObserver,
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
    -Path (Join-Path $UiRoot "src\components\AudioFunctionMidiStreamerElement.ts") `
    -Content @'
import {
  MidiStreamerDomEvents,
  type IMidiSongStreamer,
  type MidiSong,
  type MidiStreamCompleted,
  type MidiStreamFailure,
  type MidiStreamMessage,
  type MidiStreamSubscription,
} from "@monorepo/audio-function-midi-streamer-contracts";
import { css, html, LitElement, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

import { DomMidiStreamSink } from "../internal/DomMidiStreamSink.js";

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

  @property({ attribute: false })
  public streamer: IMidiSongStreamer | null = null;

  @property({ type: Boolean, reflect: true })
  public disabled = false;

  @state()
  private selectedSongId = "";

  @state()
  private isPlaying = false;

  @state()
  private statusText = "No songs loaded";

  private currentSubscription: MidiStreamSubscription | null = null;

  public override disconnectedCallback(): void {
    this.stopCurrentStream(false);
    super.disconnectedCallback();
  }

  protected override updated(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has("disabled") && this.disabled) {
      this.stopCurrentStream(true);
    }

    if (changedProperties.has("songs")) {
      this.syncSelectedSong();
    }
  }

  protected override render(): TemplateResult {
    const hasSongs = this.songs.length > 0;
    const canPlay =
      !this.disabled &&
      !this.isPlaying &&
      hasSongs;

    return html`
      <section class="root">
        <div class="field">
          <label for="song-selector">Song</label>

          <select
            id="song-selector"
            .value=${this.selectedSongId}
            ?disabled=${this.disabled || this.isPlaying || !hasSongs}
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

  private readonly handleSongChanged = (event: Event): void => {
    const target = event.target;

    if (!(target instanceof HTMLSelectElement)) {
      return;
    }

    this.selectedSongId = target.value;

    const selectedSong = this.getSelectedSong();

    this.statusText =
      selectedSong === null
        ? `Selected song not found: ${target.value}`
        : `Selected: ${selectedSong.title}`;
  };

  private readonly playSelectedSong = (): void => {
    if (this.disabled || this.isPlaying) {
      return;
    }

    const song = this.getSelectedSong();

    if (song === null) {
      this.publishFailure(`Song not found: ${this.selectedSongId}`);
      return;
    }

    if (this.streamer === null) {
      this.publishFailure("No MIDI song streamer has been configured.");
      return;
    }

    this.stopCurrentStream(false);

    this.isPlaying = true;
    this.statusText = `Playing: ${song.title}`;

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
      new DomMidiStreamSink(this, {
        onMidiStreamMessage: (event) => this.onMidiStreamMessage(event),
        onMidiStreamCompleted: (event) => this.onMidiStreamCompleted(event),
        onMidiStreamFailed: (error) => this.onMidiStreamFailed(error),
      }),
    );
  };

  private readonly stopByUser = (): void => {
    this.stopCurrentStream(true);
  };

  private onMidiStreamMessage(event: MidiStreamMessage): void {
    this.statusText =
      `Playing event ${event.eventIndex + 1}/${this.getSelectedSong()?.events.length ?? "?"}`;
  }

  private onMidiStreamCompleted(_event: MidiStreamCompleted): void {
    this.currentSubscription = null;
    this.isPlaying = false;
    this.statusText = "Completed";
  }

  private onMidiStreamFailed(error: MidiStreamFailure): void {
    this.currentSubscription = null;
    this.isPlaying = false;
    this.statusText = `Failed: ${error.message}`;
  }

  private stopCurrentStream(updateStatus: boolean): void {
    if (this.currentSubscription !== null) {
      this.currentSubscription.cancel();
      this.currentSubscription = null;
    }

    this.isPlaying = false;

    if (updateStatus) {
      this.statusText = "Stopped";
    }
  }

  private syncSelectedSong(): void {
    if (this.songs.length === 0) {
      this.selectedSongId = "";
      this.statusText = "No songs loaded";
      return;
    }

    const selectedStillExists = this.songs.some(
      (song) => song.id === this.selectedSongId,
    );

    if (!selectedStillExists) {
      this.selectedSongId = this.songs[0]?.id ?? "";
    }

    this.statusText = `${this.songs.length} song(s) loaded`;
  }

  private getSelectedSong(): MidiSong | null {
    return this.songs.find((song) => song.id === this.selectedSongId) ?? null;
  }

  private publishFailure(message: string): void {
    this.stopCurrentStream(false);
    this.statusText = `Failed: ${message}`;

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
}

declare global {
  interface HTMLElementTagNameMap {
    "audio-function-midi-streamer": AudioFunctionMidiStreamerElement;
  }
}
'@

Write-Utf8File `
    -Path (Join-Path $UiRoot "src\index.ts") `
    -Content @'
export * from "./components/AudioFunctionMidiStreamerElement.js";
'@

Write-Utf8File `
    -Path (Join-Path $UiRoot "tests\AudioFunctionMidiStreamerElement.test.ts") `
    -Content @'
import { describe, it } from "vitest";
import { should } from "chai";
import {
  AudioFunctionMidiStreamerElement,
  AudioFunctionMidiStreamerElementTagName,
} from "../src/index.js";

should();

describe("AudioFunctionMidiStreamerElement", () => {
  it("should register the Lit custom element", () => {
    customElements
      .get(AudioFunctionMidiStreamerElementTagName)
      .should.equal(AudioFunctionMidiStreamerElement);
  });
});
'@

Write-Host ""
Write-Host "Done."
Write-Host ""
Write-Host "Created/updated packages:"
Write-Host "  @monorepo/audio-function-midi-streamer-contracts"
Write-Host "  @monorepo/audio-function-midi-streamer"
Write-Host "  @monorepo/audio-function-midi-streamer-contracts-web-audio"
Write-Host "  @monorepo/audio-function-midi-streamer-ui"
Write-Host ""
Write-Host "Sample JSON database:"
Write-Host "  $MidiStreamerRoot\sample-songs\midi-songs.json"
Write-Host "  $CoreRoot\sample-songs\midi-songs.json"
if (Test-Path -LiteralPath $ModuleBasicRoot -PathType Container) {
    Write-Host "  $ModuleBasicRoot\public\midi-songs\midi-songs.json"
}
Write-Host ""
Write-Host "Run:"
Write-Host '  cd "C:\Users\danha\source\repos\HTML\MonoRepro"'
Write-Host "  pnpm install"
Write-Host "  pnpm --filter @monorepo/audio-function-midi-streamer-contracts build"
Write-Host "  pnpm --filter @monorepo/audio-function-midi-streamer build"
Write-Host "  pnpm --filter @monorepo/audio-function-midi-streamer-contracts-web-audio build"
Write-Host "  pnpm --filter @monorepo/audio-function-midi-streamer-ui build"
Write-Host "  pnpm --filter @monorepo/audio-function-midi-streamer test"

