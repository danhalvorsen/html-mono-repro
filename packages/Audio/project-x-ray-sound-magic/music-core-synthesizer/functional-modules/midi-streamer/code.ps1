# FILE: code.populate-midi-streamer.ps1

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$TargetRoot = $PSScriptRoot,

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$PackageScope = "@monorepo",

    [Parameter(Mandatory = $false)]
    [switch]$Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ContractsFolder = "audio-function-midi-streamer-contracts"
$CoreFolder = "audio-function-midi-streamer"
$UiFolder = "audio-function-midi-streamer-ui"
$WebAudioFolder = "audio-function-midi-streamer-web-audio"

$ContractsPackage = "$PackageScope/$ContractsFolder"
$CorePackage = "$PackageScope/$CoreFolder"
$UiPackage = "$PackageScope/$UiFolder"
$WebAudioPackage = "$PackageScope/$WebAudioFolder"

function New-DirectoryIfMissing {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Path $Path | Out-Null
        Write-Host "Created directory: $Path"
    }
}

function Write-Utf8NoBomFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [AllowEmptyString()]
        [string]$Content
    )

    if ((Test-Path -LiteralPath $Path) -and -not $Force) {
        Write-Host "Skipped existing file: $Path"
        return
    }

    $directory = Split-Path -Parent $Path
    New-DirectoryIfMissing -Path $directory

    $encoding = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Content, $encoding)

    Write-Host "Wrote file: $Path"
}

function ConvertTo-StableJson {
    param(
        [Parameter(Mandatory = $true)]
        [object]$Value
    )

    return ($Value | ConvertTo-Json -Depth 64)
}

function New-PackageJson {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PackageName,

        [Parameter(Mandatory = $true)]
        [hashtable]$Dependencies
    )

    $package = [ordered]@{
        name = $PackageName
        version = "1.0.0"
        description = ""
        type = "module"
        main = "./dist/index.js"
        types = "./dist/index.d.ts"
        exports = [ordered]@{
            "." = [ordered]@{
                types = "./dist/index.d.ts"
                import = "./dist/index.js"
            }
        }
        files = @(
            "dist"
        )
        scripts = [ordered]@{
            clean = "rimraf dist"
            build = "tsc -p tsconfig.json"
            test = "vitest run"
            "test:typecheck" = "vitest run --typecheck"
        }
        keywords = @(
            "audio"
            "midi"
            "streamer"
            "synthesizer"
        )
        license = "MIT"
        dependencies = [ordered]@{}
        devDependencies = [ordered]@{
            "@types/node" = "^20.0.0"
            "chai" = "^5.0.0"
            "rimraf" = "^6.0.0"
            "typescript" = "^5.0.0"
            "vitest" = "^3.0.0"
        }
    }

    foreach ($key in ($Dependencies.Keys | Sort-Object)) {
        $package.dependencies[$key] = $Dependencies[$key]
    }

    return ConvertTo-StableJson -Value $package
}

function New-TsConfigJson {
    param(
        [Parameter(Mandatory = $true)]
        [bool]$UseDom
    )

    $libraries = @("ES2022")

    if ($UseDom) {
        $libraries = @("ES2022", "DOM", "DOM.Iterable")
    }

    $config = [ordered]@{
        compilerOptions = [ordered]@{
            target = "ES2022"
            module = "NodeNext"
            moduleResolution = "NodeNext"
            lib = $libraries
            declaration = $true
            declarationMap = $true
            sourceMap = $true
            outDir = "./dist"
            rootDir = "./src"
            strict = $true
            noImplicitOverride = $true
            noUncheckedIndexedAccess = $true
            exactOptionalPropertyTypes = $true
            forceConsistentCasingInFileNames = $true
            skipLibCheck = $true
        }
        include = @(
            "src/**/*.ts"
        )
        exclude = @(
            "dist",
            "node_modules",
            "tests"
        )
    }

    return ConvertTo-StableJson -Value $config
}

function Expand-Template {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Content
    )

    return $Content.
        Replace("{{CONTRACTS_PACKAGE}}", $ContractsPackage).
        Replace("{{CORE_PACKAGE}}", $CorePackage).
        Replace("{{UI_PACKAGE}}", $UiPackage).
        Replace("{{WEB_AUDIO_PACKAGE}}", $WebAudioPackage)
}

function Write-ModuleFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ModuleFolder,

        [Parameter(Mandatory = $true)]
        [string]$RelativePath,

        [Parameter(Mandatory = $true)]
        [AllowEmptyString()]
        [string]$Content
    )

    $path = Join-Path (Join-Path $TargetRoot $ModuleFolder) $RelativePath
    Write-Utf8NoBomFile -Path $path -Content (Expand-Template -Content $Content)
}

function Initialize-ModuleShell {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ModuleFolder,

        [Parameter(Mandatory = $true)]
        [string]$PackageName,

        [Parameter(Mandatory = $true)]
        [hashtable]$Dependencies,

        [Parameter(Mandatory = $true)]
        [bool]$UseDom
    )

    $modulePath = Join-Path $TargetRoot $ModuleFolder
    New-DirectoryIfMissing -Path $modulePath
    New-DirectoryIfMissing -Path (Join-Path $modulePath "src")
    New-DirectoryIfMissing -Path (Join-Path $modulePath "tests")

    Write-Utf8NoBomFile `
        -Path (Join-Path $modulePath "package.json") `
        -Content (New-PackageJson -PackageName $PackageName -Dependencies $Dependencies)

    Write-Utf8NoBomFile `
        -Path (Join-Path $modulePath "tsconfig.json") `
        -Content (New-TsConfigJson -UseDom $UseDom)
}

New-DirectoryIfMissing -Path $TargetRoot

$coreDependencies = @{}
$coreDependencies[$ContractsPackage] = "workspace:*"

$uiDependencies = @{}
$uiDependencies[$ContractsPackage] = "workspace:*"
$uiDependencies["lit"] = "^3.0.0"

$webAudioDependencies = @{}
$webAudioDependencies[$ContractsPackage] = "workspace:*"

Initialize-ModuleShell -ModuleFolder $ContractsFolder -PackageName $ContractsPackage -Dependencies @{} -UseDom $false
Initialize-ModuleShell -ModuleFolder $CoreFolder -PackageName $CorePackage -Dependencies $coreDependencies -UseDom $false
Initialize-ModuleShell -ModuleFolder $UiFolder -PackageName $UiPackage -Dependencies $uiDependencies -UseDom $true
Initialize-ModuleShell -ModuleFolder $WebAudioFolder -PackageName $WebAudioPackage -Dependencies $webAudioDependencies -UseDom $true

# --------------------------------------------------------------------------------------
# contracts
# --------------------------------------------------------------------------------------

Write-ModuleFile -ModuleFolder $ContractsFolder -RelativePath "src/constants/MidiMessageKinds.ts" -Content @'
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

Write-ModuleFile -ModuleFolder $ContractsFolder -RelativePath "src/constants/MidiStreamerDomEvents.ts" -Content @'
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

Write-ModuleFile -ModuleFolder $ContractsFolder -RelativePath "src/model/MidiMessage.ts" -Content @'
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

Write-ModuleFile -ModuleFolder $ContractsFolder -RelativePath "src/model/MidiSong.ts" -Content @'
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

Write-ModuleFile -ModuleFolder $ContractsFolder -RelativePath "src/ports/IMidiStreamScheduler.ts" -Content @'
export interface MidiStreamSubscription {
  cancel(): void;
}

export interface IMidiStreamScheduler {
  schedule(delayMs: number, action: () => void): MidiStreamSubscription;
}
'@

Write-ModuleFile -ModuleFolder $ContractsFolder -RelativePath "src/ports/IMidiStreamSink.ts" -Content @'
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

Write-ModuleFile -ModuleFolder $ContractsFolder -RelativePath "src/ports/IMidiSongStreamer.ts" -Content @'
import type { MidiSong } from "../model/MidiSong.js";
import type { IMidiStreamSink } from "./IMidiStreamSink.js";
import type { MidiStreamSubscription } from "./IMidiStreamScheduler.js";

export interface IMidiSongStreamer {
  stream(song: MidiSong, sink: IMidiStreamSink): MidiStreamSubscription;
}
'@

Write-ModuleFile -ModuleFolder $ContractsFolder -RelativePath "src/index.ts" -Content @'
export {
  MidiMessageKinds,
  type MidiMessageKind,
} from "./constants/MidiMessageKinds.js";

export {
  MidiStreamerDomEvents,
  type MidiStreamerDomEventName,
} from "./constants/MidiStreamerDomEvents.js";

export type {
  MidiByte,
  MidiChannel,
  MidiControllerNumber,
  MidiMessage,
  MidiNoteNumber,
  MidiVelocity,
  MidiTick,
  MidiControlChangeMessage,
  MidiNoteOffMessage,
  MidiNoteOnMessage,
  MidiPitchBendMessage,
  MidiSystemExclusiveMessage,
} from "./model/MidiMessage.js";

export type {
  MidiSong,
  MidiSongId,
  MidiTimedMessage,
} from "./model/MidiSong.js";

export type {
  IMidiStreamScheduler,
  MidiStreamSubscription,
} from "./ports/IMidiStreamScheduler.js";

export type {
  IMidiStreamSink,
  MidiStreamCompleted,
  MidiStreamFailure,
  MidiStreamMessage,
} from "./ports/IMidiStreamSink.js";

export type {
  IMidiSongStreamer,
} from "./ports/IMidiSongStreamer.js";
'@

Write-ModuleFile -ModuleFolder $ContractsFolder -RelativePath "tests/MidiContracts.test.ts" -Content @'
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

# --------------------------------------------------------------------------------------
# core
# --------------------------------------------------------------------------------------

Write-ModuleFile -ModuleFolder $CoreFolder -RelativePath "src/domain/MidiSongValidationError.ts" -Content @'
export class MidiSongValidationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "MidiSongValidationError";
  }
}
'@

Write-ModuleFile -ModuleFolder $CoreFolder -RelativePath "src/domain/MidiSongValidator.ts" -Content @'
import {
  MidiMessageKinds,
  type MidiMessage,
  type MidiSong,
} from "{{CONTRACTS_PACKAGE}}";
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
        this.requireIntegerRange(message.velocity, 1, 127, `${path}.velocity`);
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

Write-ModuleFile -ModuleFolder $CoreFolder -RelativePath "src/application/MidiSongStreamer.ts" -Content @'
import type {
  IMidiSongStreamer,
  IMidiStreamScheduler,
  IMidiStreamSink,
  MidiSong,
  MidiStreamSubscription,
  MidiTimedMessage,
} from "{{CONTRACTS_PACKAGE}}";
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

Write-ModuleFile -ModuleFolder $CoreFolder -RelativePath "src/infrastructure/TimeoutMidiStreamScheduler.ts" -Content @'
import type {
  IMidiStreamScheduler,
  MidiStreamSubscription,
} from "{{CONTRACTS_PACKAGE}}";

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

Write-ModuleFile -ModuleFolder $CoreFolder -RelativePath "src/composition/MidiSongStreamerFactory.ts" -Content @'
import { MidiSongStreamer } from "../application/MidiSongStreamer.js";
import { MidiSongValidator } from "../domain/MidiSongValidator.js";
import { TimeoutMidiStreamScheduler } from "../infrastructure/TimeoutMidiStreamScheduler.js";

export class MidiSongStreamerFactory {
  public createBrowserDefault(): MidiSongStreamer {
    return new MidiSongStreamer(
      new TimeoutMidiStreamScheduler(),
      new MidiSongValidator(),
    );
  }
}
'@

Write-ModuleFile -ModuleFolder $CoreFolder -RelativePath "src/index.ts" -Content @'
export { MidiSongStreamer } from "./application/MidiSongStreamer.js";
export { MidiSongStreamerFactory } from "./composition/MidiSongStreamerFactory.js";
export { MidiSongValidationError } from "./domain/MidiSongValidationError.js";
export { MidiSongValidator } from "./domain/MidiSongValidator.js";
export { TimeoutMidiStreamScheduler } from "./infrastructure/TimeoutMidiStreamScheduler.js";
'@

Write-ModuleFile -ModuleFolder $CoreFolder -RelativePath "tests/MidiSongStreamer.test.ts" -Content @'
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
} from "{{CONTRACTS_PACKAGE}}";
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

# --------------------------------------------------------------------------------------
# ui
# --------------------------------------------------------------------------------------

Write-ModuleFile -ModuleFolder $UiFolder -RelativePath "src/internal/MidiSongCatalogJsonParser.ts" -Content @'
import {
  MidiMessageKinds,
  type MidiMessage,
  type MidiSong,
  type MidiTimedMessage,
} from "{{CONTRACTS_PACKAGE}}";

export class MidiSongCatalogJsonParser {
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

Write-ModuleFile -ModuleFolder $UiFolder -RelativePath "src/internal/DomMidiStreamSink.ts" -Content @'
import {
  MidiStreamerDomEvents,
  type IMidiStreamSink,
  type MidiStreamCompleted,
  type MidiStreamFailure,
  type MidiStreamMessage,
} from "{{CONTRACTS_PACKAGE}}";

export class DomMidiStreamSink implements IMidiStreamSink {
  public constructor(private readonly target: EventTarget) {}

  public send(event: MidiStreamMessage): void {
    this.dispatch(MidiStreamerDomEvents.midiMessage, event);
  }

  public complete(event: MidiStreamCompleted): void {
    this.dispatch(MidiStreamerDomEvents.streamCompleted, event);
  }

  public fail(error: MidiStreamFailure): void {
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

Write-ModuleFile -ModuleFolder $UiFolder -RelativePath "src/components/AudioFunctionMidiStreamerElement.ts" -Content @'
import { css, html, LitElement, type PropertyValues } from "lit";
import {
  MidiStreamerDomEvents,
  type IMidiSongStreamer,
  type MidiSong,
  type MidiStreamSubscription,
} from "{{CONTRACTS_PACKAGE}}";
import { DomMidiStreamSink } from "../internal/DomMidiStreamSink.js";
import { MidiSongCatalogJsonParser } from "../internal/MidiSongCatalogJsonParser.js";

export class AudioFunctionMidiStreamerElement extends LitElement {
  public static readonly styles = css`
    :host {
      display: block;
      box-sizing: border-box;
      font-family: system-ui, sans-serif;
    }

    .root {
      display: grid;
      gap: 0.5rem;
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

    .status {
      font-size: 0.75rem;
      opacity: 0.75;
    }
  `;

  public static readonly properties = {
    songs: { attribute: false },
    songSourceUrl: { attribute: "song-source-url" },
    selectedSongId: { state: true },
    disabled: { type: Boolean, reflect: true },
  };

  public songs: readonly MidiSong[] = [];
  public songSourceUrl = "";
  public selectedSongId = "";
  public disabled = false;
  public streamer: IMidiSongStreamer | undefined = undefined;

  private readonly parser = new MidiSongCatalogJsonParser();
  private currentSubscription: MidiStreamSubscription | undefined = undefined;

  public override disconnectedCallback(): void {
    this.stopCurrentStream();
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
            ?disabled=${this.disabled || !hasSongs}
            @change=${this.handleSongChanged}
          >
            ${this.songs.map(
              (song) => html`
                <option value=${song.id}>${song.title}</option>
              `,
            )}
          </select>
        </label>

        <div class="status">
          ${hasSongs ? `${this.songs.length} song(s) loaded` : "No songs loaded"}
        </div>

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

  private handleSongChanged(event: Event): void {
    const target = event.target;

    if (!(target instanceof HTMLSelectElement)) {
      return;
    }

    this.selectedSongId = target.value;
    this.streamSelectedSong();
  }

  private streamSelectedSong(): void {
    const song = this.songs.find((candidate) => candidate.id === this.selectedSongId);

    if (song === undefined) {
      this.dispatchFailure(`Song not found: ${this.selectedSongId}`);
      return;
    }

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

    if (this.streamer === undefined) {
      this.dispatchFailure("No MIDI song streamer has been configured.");
      return;
    }

    this.stopCurrentStream();
    this.currentSubscription = this.streamer.stream(song, new DomMidiStreamSink(this));
  }

  private stopCurrentStream(): void {
    if (this.currentSubscription === undefined) {
      return;
    }

    this.currentSubscription.cancel();
    this.currentSubscription = undefined;
  }

  private dispatchFailure(message: string): void {
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

Write-ModuleFile -ModuleFolder $UiFolder -RelativePath "src/components/defineAudioFunctionMidiStreamerElement.ts" -Content @'
import { AudioFunctionMidiStreamerElement } from "./AudioFunctionMidiStreamerElement.js";

export const AudioFunctionMidiStreamerElementTagName =
  "audio-function-midi-streamer";

export function defineAudioFunctionMidiStreamerElement(
  registry: CustomElementRegistry = customElements,
): void {
  if (registry.get(AudioFunctionMidiStreamerElementTagName) !== undefined) {
    return;
  }

  registry.define(
    AudioFunctionMidiStreamerElementTagName,
    AudioFunctionMidiStreamerElement,
  );
}
'@

Write-ModuleFile -ModuleFolder $UiFolder -RelativePath "src/index.ts" -Content @'
export { AudioFunctionMidiStreamerElement } from "./components/AudioFunctionMidiStreamerElement.js";
export {
  AudioFunctionMidiStreamerElementTagName,
  defineAudioFunctionMidiStreamerElement,
} from "./components/defineAudioFunctionMidiStreamerElement.js";
export { MidiSongCatalogJsonParser } from "./internal/MidiSongCatalogJsonParser.js";
'@

Write-ModuleFile -ModuleFolder $UiFolder -RelativePath "tests/MidiSongCatalogJsonParser.test.ts" -Content @'
import { describe, it } from "vitest";
import { should } from "chai";
import { MidiMessageKinds } from "{{CONTRACTS_PACKAGE}}";
import { MidiSongCatalogJsonParser } from "../src/internal/MidiSongCatalogJsonParser.js";

should();

describe("MidiSongCatalogJsonParser", () => {
  it("should parse a song catalog object", () => {
    const parser = new MidiSongCatalogJsonParser();

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

  it("should reject invalid catalog payloads", () => {
    const parser = new MidiSongCatalogJsonParser();

    (() => parser.parse({ songs: "not-array" })).should.throw(TypeError);
  });
});
'@

# --------------------------------------------------------------------------------------
# web audio
# --------------------------------------------------------------------------------------

Write-ModuleFile -ModuleFolder $WebAudioFolder -RelativePath "src/domain/EqualTemperamentFrequencyMapper.ts" -Content @'
export interface IFrequencyMapper {
  mapMidiNoteToFrequency(note: number): number;
}

export class EqualTemperamentFrequencyMapper implements IFrequencyMapper {
  public mapMidiNoteToFrequency(note: number): number {
    if (!Number.isInteger(note) || note < 0 || note > 127) {
      throw new RangeError("note must be an integer in range 0..127.");
    }

    return 440 * 2 ** ((note - 69) / 12);
  }
}
'@

Write-ModuleFile -ModuleFolder $WebAudioFolder -RelativePath "src/infrastructure/WebAudioMidiStreamSink.ts" -Content @'
import {
  MidiMessageKinds,
  type IMidiStreamSink,
  type MidiStreamCompleted,
  type MidiStreamFailure,
  type MidiStreamMessage,
} from "{{CONTRACTS_PACKAGE}}";
import {
  EqualTemperamentFrequencyMapper,
  type IFrequencyMapper,
} from "../domain/EqualTemperamentFrequencyMapper.js";

export interface WebAudioMidiStreamSinkOptions {
  readonly context: AudioContext;
  readonly output: AudioNode;
  readonly oscillatorType: OscillatorType;
  readonly maxGain: number;
  readonly releaseSeconds: number;
  readonly frequencyMapper: IFrequencyMapper;
}

interface ActiveVoice {
  readonly oscillator: OscillatorNode;
  readonly gain: GainNode;
}

export class WebAudioMidiStreamSink implements IMidiStreamSink {
  private readonly voices = new Map<string, ActiveVoice>();

  public constructor(private readonly options: WebAudioMidiStreamSinkOptions) {
    if (options.maxGain < 0 || options.maxGain > 1) {
      throw new RangeError("maxGain must be in range 0..1.");
    }

    if (options.releaseSeconds < 0) {
      throw new RangeError("releaseSeconds must be non-negative.");
    }
  }

  public static createDefault(context: AudioContext): WebAudioMidiStreamSink {
    return new WebAudioMidiStreamSink({
      context,
      output: context.destination,
      oscillatorType: "sine",
      maxGain: 0.2,
      releaseSeconds: 0.03,
      frequencyMapper: new EqualTemperamentFrequencyMapper(),
    });
  }

  public send(event: MidiStreamMessage): void {
    switch (event.message.kind) {
      case MidiMessageKinds.noteOn:
        if (event.message.velocity === 0) {
          this.stopVoice(event.message.channel, event.message.note);
          return;
        }

        this.startVoice(
          event.message.channel,
          event.message.note,
          event.message.velocity,
        );
        return;

      case MidiMessageKinds.noteOff:
        this.stopVoice(event.message.channel, event.message.note);
        return;

      case MidiMessageKinds.controlChange:
      case MidiMessageKinds.pitchBend:
      case MidiMessageKinds.systemExclusive:
        return;
    }
  }

  public complete(_event: MidiStreamCompleted): void {
    this.stopAllVoices();
  }

  public fail(_error: MidiStreamFailure): void {
    this.stopAllVoices();
  }

  private startVoice(channel: number, note: number, velocity: number): void {
    this.stopVoice(channel, note);

    const oscillator = this.options.context.createOscillator();
    const gain = this.options.context.createGain();
    const frequency = this.options.frequencyMapper.mapMidiNoteToFrequency(note);
    const now = this.options.context.currentTime;

    oscillator.type = this.options.oscillatorType;
    oscillator.frequency.setValueAtTime(frequency, now);

    gain.gain.setValueAtTime(
      (velocity / 127) * this.options.maxGain,
      now,
    );

    oscillator.connect(gain);
    gain.connect(this.options.output);
    oscillator.start(now);

    this.voices.set(this.createVoiceKey(channel, note), {
      oscillator,
      gain,
    });
  }

  private stopVoice(channel: number, note: number): void {
    const key = this.createVoiceKey(channel, note);
    const voice = this.voices.get(key);

    if (voice === undefined) {
      return;
    }

    this.voices.delete(key);

    const now = this.options.context.currentTime;
    const stopAt = now + this.options.releaseSeconds;

    voice.gain.gain.cancelScheduledValues(now);
    voice.gain.gain.setValueAtTime(voice.gain.gain.value, now);
    voice.gain.gain.linearRampToValueAtTime(0, stopAt);

    voice.oscillator.stop(stopAt);
    voice.oscillator.onended = (): void => {
      voice.oscillator.disconnect();
      voice.gain.disconnect();
    };
  }

  private stopAllVoices(): void {
    const voiceKeys = [...this.voices.keys()];

    for (const key of voiceKeys) {
      const [channelText, noteText] = key.split(":");
      const channel = Number(channelText);
      const note = Number(noteText);

      if (Number.isInteger(channel) && Number.isInteger(note)) {
        this.stopVoice(channel, note);
      }
    }
  }

  private createVoiceKey(channel: number, note: number): string {
    return `${channel}:${note}`;
  }
}
'@

Write-ModuleFile -ModuleFolder $WebAudioFolder -RelativePath "src/index.ts" -Content @'
export {
  EqualTemperamentFrequencyMapper,
  type IFrequencyMapper,
} from "./domain/EqualTemperamentFrequencyMapper.js";

export {
  WebAudioMidiStreamSink,
  type WebAudioMidiStreamSinkOptions,
} from "./infrastructure/WebAudioMidiStreamSink.js";
'@

Write-ModuleFile -ModuleFolder $WebAudioFolder -RelativePath "tests/EqualTemperamentFrequencyMapper.test.ts" -Content @'
import { describe, it } from "vitest";
import { should } from "chai";
import { EqualTemperamentFrequencyMapper } from "../src/domain/EqualTemperamentFrequencyMapper.js";

should();

describe("EqualTemperamentFrequencyMapper", () => {
  it("should map A4 to 440Hz", () => {
    const mapper = new EqualTemperamentFrequencyMapper();

    mapper.mapMidiNoteToFrequency(69).should.equal(440);
  });

  it("should reject invalid MIDI notes", () => {
    const mapper = new EqualTemperamentFrequencyMapper();

    (() => mapper.mapMidiNoteToFrequency(128)).should.throw(RangeError);
  });
});
'@
# --------------------------------------------------------------------------------------
# root docs and sample songs
# --------------------------------------------------------------------------------------

$moduleSummaryLines = @(
    "# Audio Function MIDI Streamer Modules",
    "",
    "## Package Set",
    "",
    "````text",
    "audio-function-midi-streamer-contracts",
    "audio-function-midi-streamer",
    "audio-function-midi-streamer-ui",
    "audio-function-midi-streamer-web-audio",
    "````",
    "",
    "## Responsibility Split",
    "",
    "| Package | Responsibility |",
    "|---|---|",
    "| ``audio-function-midi-streamer-contracts`` | Public contracts, MIDI song model, stream sink/source ports, DOM event constants. |",
    "| ``audio-function-midi-streamer`` | Domain/application MIDI streaming orchestration. No DOM. No Web Audio. |",
    "| ``audio-function-midi-streamer-ui`` | Lit 3 Web Component with song dropdown and slotted MIDI data event stream. |",
    "| ``audio-function-midi-streamer-web-audio`` | Web Audio sink that consumes streamed MIDI events. |",
    "",
    "## Flow",
    "",
    "````text",
    "JSON song catalog",
    "    ->",
    "<audio-function-midi-streamer>",
    "    ->",
    "song dropdown selection",
    "    ->",
    "IMidiSongStreamer",
    "    ->",
    "IMidiStreamSink",
    "    ->",
    "CustomEvent stream to slotted/listening components",
    "    ->",
    "optional WebAudioMidiStreamSink",
    "````",
    "",
    "## Web Component",
    "",
    "````html",
    "<audio-function-midi-streamer song-source-url=""/midi-songs.json"">",
    "  <some-midi-listener slot=""midi-data""></some-midi-listener>",
    "</audio-function-midi-streamer>",
    "````",
    "",
    "The component dispatches these typed DOM events:",
    "",
    "````text",
    "audio-function-midi-streamer:songs-loaded",
    "audio-function-midi-streamer:song-selected",
    "audio-function-midi-streamer:midi-message",
    "audio-function-midi-streamer:stream-completed",
    "audio-function-midi-streamer:stream-failed",
    "````"
)

$moduleSummaryPath = Join-Path $TargetRoot "modules.summary.md"
$moduleSummaryContent = $moduleSummaryLines -join [Environment]::NewLine

Write-Utf8NoBomFile -Path $moduleSummaryPath -Content $moduleSummaryContent

$sampleSongs = [ordered]@{
    songs = @(
        [ordered]@{
            id = "london-bridge"
            title = "London Bridge"
            tempoBpm = 120
            ticksPerQuarterNote = 480
            events = @(
                [ordered]@{
                    tick = 0
                    message = [ordered]@{
                        kind = "note-on"
                        channel = 0
                        note = 67
                        velocity = 100
                    }
                },
                [ordered]@{
                    tick = 480
                    message = [ordered]@{
                        kind = "note-off"
                        channel = 0
                        note = 67
                        velocity = 0
                    }
                },
                [ordered]@{
                    tick = 480
                    message = [ordered]@{
                        kind = "note-on"
                        channel = 0
                        note = 65
                        velocity = 100
                    }
                },
                [ordered]@{
                    tick = 960
                    message = [ordered]@{
                        kind = "note-off"
                        channel = 0
                        note = 65
                        velocity = 0
                    }
                }
            )
        }
    )
}

$sampleSongsPath = Join-Path $TargetRoot "sample-songs\midi-songs.json"
$sampleSongsContent = ConvertTo-StableJson -Value $sampleSongs

Write-Utf8NoBomFile -Path $sampleSongsPath -Content $sampleSongsContent

Write-Host ""
Write-Host "Done. Populated MIDI Streamer modules under:"
Write-Host $TargetRoot
Write-Host ""
Write-Host "Created:"
Write-Host " - $ContractsFolder"
Write-Host " - $CoreFolder"
Write-Host " - $UiFolder"
Write-Host " - $WebAudioFolder"