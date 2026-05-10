import { describe, expect, it } from "vitest";
import { PianoOctave } from "../piano-octave";
import { DefaultPianoRootConfiguration } from "../../piano/PianoRootConfiguration";
import { MidiStatus } from "@monorepo/music-core-midi";

describe("piano-octave per-tangent sound", () => {
  it("sends different midi note values to player for different tangents", () => {
    const octave = new PianoOctave();
    octave.options = DefaultPianoRootConfiguration.octaves[0];

    const playedNotes: number[] = [];
    (octave as unknown as { midiPlayer: { play: (message: { status: MidiStatus; note: { value: () => number } }) => void } }).midiPlayer = {
      play: (message: { status: MidiStatus; note: { value: () => number } }) => {
        if (message.status === MidiStatus.NoteOn) {
          playedNotes.push(message.note.value());
        }
      },
    };

    const c = octave.options.tangent.C;
    const d = octave.options.tangent.D;
    const e = octave.options.tangent.E;

    (octave as unknown as { startHold: (pointerId: number, tangent: typeof c) => unknown }).startHold(1, c);
    (octave as unknown as { endHold: (pointerId: number) => unknown }).endHold(1);

    (octave as unknown as { startHold: (pointerId: number, tangent: typeof d) => unknown }).startHold(2, d);
    (octave as unknown as { endHold: (pointerId: number) => unknown }).endHold(2);

    (octave as unknown as { startHold: (pointerId: number, tangent: typeof e) => unknown }).startHold(3, e);
    (octave as unknown as { endHold: (pointerId: number) => unknown }).endHold(3);

    expect(playedNotes.length).toBe(3);
    expect(new Set(playedNotes).size).toBe(3);
    expect(playedNotes[0]).not.toBe(playedNotes[1]);
    expect(playedNotes[1]).not.toBe(playedNotes[2]);
  });
});
