# hello-notes-deterministic-adapter

Deterministic adapter that converts note-notation text into a Standard MIDI File (SMF) binary string and parses it through `@monorepo/music-core-midi-accords-playback`.

## Flow

1. `Song.get()` returns notation tokens like:
   `C4-h500-v92-ch1`
2. `Converter` transforms notation -> SMF binary string.
3. `MidiEventEngine.play(song)` parses SMF and returns logical MIDI events.
4. `Player.play(song)` returns deterministic `MidiLogicalEvent[]`.

## Public API

- `Song`: provides notation text.
- `Player.play(song): readonly MidiLogicalEvent[]`
- `Converter.convert(song): readonly MidiLogicalEvent[]`

## Example

```ts
import { Player, Song } from "@monorepo/hello-notes-deterministic-adapters";

const player = new Player();
const events = player.play(new Song());

console.log(events.map((e) => `${e.kind}@${Math.round(e.timestampMs)}ms`));
```

## Notes

- Output is deterministic for identical input.
- Timing is derived from MIDI ticks + tempo map in `music-core-midi-accords-playback`.
- No real-time scheduling is performed in this adapter.
