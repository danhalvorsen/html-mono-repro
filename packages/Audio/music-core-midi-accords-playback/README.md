# Music Core MIDI Accords Playback

A TypeScript module for parsing and processing MIDI files into logical events with accurate timing information. This package provides a robust MIDI event engine that transforms binary MIDI data into structured events with per-note duration tracking.

## Features

- **MIDI File Parsing**: Full support for Standard MIDI File (SMF) format (types 0, 1, and 2)
- **Event Transformation**: Converts raw MIDI events into structured, type-safe logical events
- **Timing Calculation**: Accurate timestamp calculation with support for tempo changes
- **Note Duration Tracking**: Automatically calculates duration for each note event
- **Event Sorting**: Maintains proper event ordering by tick, type, track, and sequence
- **Comprehensive Error Handling**: Detailed error messages for invalid MIDI data

## Installation

```bash
pnpm install @monorepo/music-core-midi-accords-playback
```

## Usage

### Basic Example

```typescript
import { MidiEventEngine } from '@monorepo/music-core-midi-accords-playback';

// Create an engine instance
const engine = new MidiEventEngine();

// Define a song that returns MIDI binary data as a string
const song = {
  get(): string {
    // Return MIDI binary data as a binary string
    // (each character's code point represents a byte 0-255)
    return midiFileData;
  }
};

// Play the song and get logical events
const events = engine.play(song);

// Process the events
events.forEach(event => {
  console.log(`Event at ${event.timestampMs}ms on track ${event.trackIndex}`);
  
  if (event.kind === 'note-on') {
    console.log(`Note On: ${event.noteNumber}, Velocity: ${event.velocity}, Duration: ${event.durationMs}ms`);
  }
});
```

### Accessing Song Data

The `Song` interface requires a `get()` method that returns MIDI data as a binary string:

```typescript
const song: Song = {
  get(): string {
    // Option 1: Read from FileReader API
    // return await fileReader.readAsBinaryString(file);
    
    // Option 2: From ArrayBuffer/Uint8Array
    // const uint8 = new Uint8Array(buffer);
    // return String.fromCharCode(...uint8);
    
    // Option 3: From base64
    // return atob(base64String);
    
    return midiData;
  }
};
```

## Event Types

### MidiLogicalEvent

The engine returns an array of `MidiLogicalEvent`, which can be one of:

#### MidiNoteOnLogicalEvent
```typescript
{
  kind: 'note-on';
  noteNumber: number;      // 0-127
  velocity: number;        // 0-127
  durationMs: number;      // Duration in milliseconds
  channel: number;         // 1-16
  timestampMs: number;     // Absolute timestamp
  absoluteTick: number;    // MIDI ticks
}
```

#### MidiNoteOffLogicalEvent
```typescript
{
  kind: 'note-off';
  noteNumber: number;      // 0-127
  velocity: number;        // 0-127
  channel: number;         // 1-16
  timestampMs: number;
}
```

#### MidiMetaLogicalEvent
```typescript
{
  kind: 'meta';
  metaKind: 'set-tempo' | 'time-signature' | 'key-signature' | 'track-name' | 'end-of-track' | 'unknown';
  // Optional fields depending on metaKind:
  tempoMicrosecondsPerQuarterNote?: number;
  timeSignature?: MidiTimeSignature;
  keySignature?: MidiKeySignature;
  text?: string;
  timestampMs: number;
}
```

#### Other Events
- `MidiChannelLogicalEvent`: Control changes, program changes, channel pressure, etc.
- `MidiSysExLogicalEvent`: System exclusive messages
- `MidiSystemLogicalEvent`: System real-time messages

## API Reference

### MidiEventEngine

```typescript
class MidiEventEngine implements IMidiEventEngine {
  play(song: Song): readonly MidiLogicalEvent[];
}
```

Parses a MIDI song and returns all events with calculated timings and durations.

### Exported Types and Enums

```typescript
// Enums
MidiLogicalEventKind
MidiChannelMessageKind
MidiMetaEventKind
MidiChannelCommand
MidiStatus

// Types
MidiLogicalEvent
MidiFileHeader
MidiDivision
MidiTimeSignature
MidiKeySignature

// Interfaces
IMidiEventEngine
Song

// Error
MidiParseError
```

## Module Structure

```
src/
├── engine/              # Main engine implementation
├── parser/              # MIDI file parsing utilities
├── processor/           # Event processing and transformation
├── types/               # Type definitions
├── errors/              # Error classes
├── utils/               # Helper utilities
└── index.ts             # Public API exports
```

### Key Components

- **MidiEventEngine**: Main entry point
- **StandardMidiFileParser**: Parses binary MIDI data
- **TempoMap**: Tracks tempo changes for timestamp calculation
- **MidiLogicalEventFactory**: Transforms parsed events to logical events
- **StableEventSorter**: Ensures consistent event ordering
- **MidiByteReader**: Utilities for reading MIDI binary data

## Error Handling

The module throws `MidiParseError` for invalid MIDI data:

```typescript
import { MidiParseError } from '@monorepo/music-core-midi-accords-playback';

try {
  const events = engine.play(invalidSong);
} catch (error) {
  if (error instanceof MidiParseError) {
    console.error('Invalid MIDI:', error.message);
  }
}
```

Common errors:
- `"Invalid MIDI header: missing MThd chunk"`
- `"Invalid MIDI format: ${format}"`
- `"Invalid MIDI track: missing End-of-Track meta event"`
- `"Unexpected end of MIDI file"`

## Performance Notes

- Events are frozen (immutable) after creation
- The engine uses a single-pass parsing approach
- Event sorting is O(n log n) in the number of events
- Suitable for real-time and batch MIDI processing

## Supported MIDI Features

### Supported Events
- ✅ Note On / Note Off
- ✅ Control Change (CC)
- ✅ Program Change
- ✅ Channel Pressure
- ✅ Pitch Bend
- ✅ Polyphonic Key Pressure
- ✅ Meta Events (Tempo, Time Signature, Key Signature, Track Name)
- ✅ System Exclusive (SysEx)

### Timing
- ✅ Ticks Per Quarter Note (PPQN) division
- ✅ SMPTE frame-based timing
- ✅ Tempo changes (Set Tempo meta events)
- ✅ Automatic note duration calculation

### Formats
- ✅ Format 0 (single track)
- ✅ Format 1 (multiple tracks, synchronized)
- ✅ Format 2 (multiple independent sequences)

## Examples

### Processing All Note Events

```typescript
const noteEvents = events.filter(e => e.kind === 'note-on' || e.kind === 'note-off');

for (const event of noteEvents) {
  if (event.kind === 'note-on') {
    console.log(`Play note ${event.noteNumber} for ${event.durationMs}ms`);
  }
}
```

### Grouping Events by Track

```typescript
const eventsByTrack = new Map<number, MidiLogicalEvent[]>();

for (const event of events) {
  if (!eventsByTrack.has(event.trackIndex)) {
    eventsByTrack.set(event.trackIndex, []);
  }
  eventsByTrack.get(event.trackIndex)!.push(event);
}
```

### Extracting Tempo Information

```typescript
const tempoEvents = events.filter(
  e => e.kind === 'meta' && e.metaKind === 'set-tempo'
);

tempoEvents.forEach(e => {
  console.log(`Tempo: ${1_000_000 / e.tempoMicrosecondsPerQuarterNote! * 60} BPM`);
});
```

## License

See LICENSE file in the repository root.
