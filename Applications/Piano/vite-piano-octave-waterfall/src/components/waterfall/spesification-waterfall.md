````md
# Specification: Piano Waterfall

## 1. Purpose

The waterfall visualizes MIDI notes as falling objects mapped to piano-key columns.

The waterfall exposes one public operation API:

`IWaterfall`

Core waterfall domain types must reuse the MIDI domain from:

```ts
@monorepo/music-core-midi
````

The waterfall must not redefine MIDI note, channel, velocity, message, or parsed MIDI sequence concepts.

## 2. Required MIDI Imports

```ts
import type {
  MidiMessage,
  MidiNote,
  MidiVelocity,
  MidiChannel,
  ParsedSequence,
  ParsedStep,
} from "@monorepo/music-core-midi";
```

The waterfall domain must use:

```ts
MidiNote
```

instead of:

```ts
type Note = number;
```

A MIDI note value must be accessed through:

```ts
note.value()
```

The waterfall must never treat notes as anonymous numbers inside the public API.

## 3. Public API

```ts
export interface IWaterfall {
  addNote(note: MidiNote): FallingNoteId;

  addAccord(notes: readonly MidiNote[]): FallingAccordId;

  addMidiMessage(message: MidiMessage): void;

  addParsedStep(step: ParsedStep): void;

  addParsedSequence(sequence: ParsedSequence): void;

  removeNote(note: MidiNote): void;

  removeFallingNote(id: FallingNoteId): void;

  removeFallingAccord(id: FallingAccordId): void;

  clearWaterfall(): void;

  getNotesInColumn(note: MidiNote): number;

  getNotesInWaterfall(): number;

  getAccordsInWaterfall(): number;

  setSpeed(speed: WaterfallSpeed): void;

  currentlyPlayedNote(note: MidiNote): void;

  currentlyPlayedAccord(notes: readonly MidiNote[]): void;

  currentlyPlayedMidiMessage(message: MidiMessage): void;

  setColorScheme(colorScheme: WaterfallColorScheme): void;

  setActionScheme(actionScheme: WaterfallActionScheme): void;

  evaluationReport(): WaterfallEvaluationReport;
}
```

## 4. Domain Types

```ts
export type FallingNoteId = string;

export type FallingAccordId = string;

export type WaterfallSpeed = number;
```

`WaterfallSpeed` is normalized.

Valid range:

```ts
0 <= speed <= 1
```

Rules:

* `0` means no movement.
* `1` means maximum configured waterfall speed.
* values below `0` are clamped to `0`.
* values above `1` are clamped to `1`.
* speed affects all active and future falling notes.

## 5. Falling Note

```ts
export interface FallingNote {
  readonly id: FallingNoteId;
  readonly note: MidiNote;
  readonly channel?: MidiChannel;
  readonly velocity?: MidiVelocity;
  readonly y: number;
  readonly evaluated: boolean;
}
```

Rules:

* `note` is always a `MidiNote`.
* `channel` is optional because a visual waterfall column is note-based, not channel-based.
* `velocity` may be used by rendering or evaluation.
* `y` represents the vertical position in the waterfall.
* `evaluated` prevents duplicate evaluation.

## 6. Falling Accord

```ts
export interface FallingAccord {
  readonly id: FallingAccordId;
  readonly notes: readonly MidiNote[];
  readonly y: number;
  readonly evaluated: boolean;
}
```

Rules:

* an accord contains two or more `MidiNote` values.
* note order must not matter during comparison.
* duplicated notes are invalid unless explicitly supported later.
* an accord is evaluated as one logical unit.
* all notes in the accord are still rendered in their mapped columns.

## 7. MIDI Message Behavior

```ts
addMidiMessage(message: MidiMessage): void;
currentlyPlayedMidiMessage(message: MidiMessage): void;
```

Rules:

* `MidiStatus.NoteOn` with velocity greater than zero adds or plays a note.
* `MidiStatus.NoteOff` removes or releases a currently played note.
* `MidiStatus.NoteOn` with velocity zero should be treated as `NoteOff`.
* unsupported MIDI message types are outside this API until added to `music-core-midi`.

The waterfall must not parse raw MIDI bytes directly.
Raw MIDI parsing belongs in `music-core-midi`.

## 8. Parsed Sequence Behavior

```ts
addParsedStep(step: ParsedStep): void;

addParsedSequence(sequence: ParsedSequence): void;
```

Rules:

* `ParsedStep.message === null` represents rest/silence.
* rest steps do not create falling notes.
* `ParsedStep.holdMs` controls note duration metadata.
* `ParsedStep.velocity` must not replace `MidiVelocity`; it is parsed source data.
* `ParsedStep.channel` must not replace `MidiChannel`; it is parsed source data.
* waterfall scheduling may use `holdMs`, but note identity must still come from `MidiNote`.

## 9. Column Mapping

A waterfall column represents one piano key.

Rules:

* every `MidiNote` must map to exactly one column.
* column mapping uses `MidiNote.value()`.
* multiple falling notes may exist in the same column.
* the same `MidiNote` may occur multiple times as separate falling note instances.
* deterministic removal requires `FallingNoteId`.

```ts
removeFallingNote(id: FallingNoteId): void;
```

`removeNote(note)` removes the oldest active falling note matching the given MIDI note.

This is a convenience method only.

## 10. Note Behavior

When `addNote(note)` is called:

* the MIDI note is mapped to its waterfall column.
* a new falling note is added at the top of that column.
* the note starts moving down using the current waterfall speed.
* the note is evaluated when it reaches the evaluation line.
* the note is removed automatically when it reaches the bottom.
* the note must only be evaluated once.

## 11. Accord Behavior

When `addAccord(notes)` is called:

* all notes are inserted as one logical evaluation unit.
* each note is rendered in its mapped column.
* the accord moves as one logical unit.
* the accord is evaluated as a group.
* the accord is hit only when the currently played note set matches the expected note set.
* the accord is missed when it reaches the evaluation line without a valid match.
* the accord must only be evaluated once.

## 12. Evaluation Behavior

```ts
currentlyPlayedNote(note: MidiNote): void;

currentlyPlayedAccord(notes: readonly MidiNote[]): void;
```

Rules:

* a note hit requires the played `MidiNote.value()` to equal the expected `MidiNote.value()`.
* an accord hit requires equal MIDI note sets.
* note order must not matter for accord comparison.
* evaluation should use a configurable timing tolerance.
* evaluated notes and accords must not be evaluated again.
* evaluation must be deterministic.

## 13. Color Scheme

```ts
export interface WaterfallColorScheme {
  readonly note: string;
  readonly accord: string;
  readonly evaluationLine: string;
  readonly hit: string;
  readonly missed: string;
}
```

The color scheme defines visual colors for:

* falling notes
* falling accords
* the evaluation line
* hit state
* missed state

## 14. Action Scheme

```ts
export interface WaterfallActionScheme {
  readonly note?: WaterfallAction;
  readonly accord?: WaterfallAction;
  readonly evaluationLine?: WaterfallAction;
}

export interface WaterfallAction {
  readonly name: string;
}
```

Rules:

* actions are optional.
* actions must not change the public `IWaterfall` contract.
* rendering actions must stay outside MIDI parsing.
* evaluation actions must stay deterministic.

## 15. Evaluation Report

```ts
export interface WaterfallEvaluationReport {
  readonly totalNotes: number;
  readonly hitNotes: number;
  readonly missedNotes: number;
  readonly accuracy: number;
  readonly distribution: WaterfallNoteDistribution;
}

export interface WaterfallNoteDistribution {
  readonly [midiNote: string]: WaterfallNoteStatistics;
}

export interface WaterfallNoteStatistics {
  readonly hit: number;
  readonly missed: number;
  readonly total: number;
  readonly accuracy: number;
}
```

`distribution` keys must use the MIDI note number as string:

```ts
note.value().toString()
```

`accuracy` is calculated as:

```ts
totalNotes === 0 ? 0 : (hitNotes / totalNotes) * 100
```

## 16. Report Comparison

Report comparison is not part of `IWaterfall`.

Use a separate service.

```ts
export interface IWaterfallReportComparer {
  compare(
    previous: WaterfallEvaluationReport,
    current: WaterfallEvaluationReport
  ): WaterfallEvaluationComparison;
}
```

```ts
export interface WaterfallEvaluationComparison {
  readonly previousAccuracy: number;
  readonly currentAccuracy: number;
  readonly accuracyDelta: number;
  readonly hitDelta: number;
  readonly missedDelta: number;
}
```

## 17. Required Invariants

* `IWaterfall` is the only public operation API.
* MIDI concepts come from `@monorepo/music-core-midi`.
* waterfall code must not redefine `Note`.
* waterfall code must use `MidiNote`.
* every `MidiNote` maps to exactly one column.
* one column may contain many falling notes.
* notes are added at the top of the waterfall.
* notes move downward according to waterfall speed.
* notes are removed when they reach the bottom.
* notes are evaluated at the evaluation line.
* notes and accords are evaluated once only.
* reports only include evaluated notes.
* rendering must not change the public API.
* raw MIDI parsing belongs outside the waterfall.
* report comparison belongs outside `IWaterfall`.

```

Key change: the waterfall domain no longer owns `Note`. It consumes `MidiNote`, `MidiMessage`, `ParsedStep`, and `ParsedSequence` from `@monorepo/music-core-midi`.
```
