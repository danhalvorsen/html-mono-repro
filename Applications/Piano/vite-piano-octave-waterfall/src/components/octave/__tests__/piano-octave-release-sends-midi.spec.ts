import { describe, expect, it } from "vitest";
import { MidiStatus } from "@monorepo/music-core-midi";
import { PianoOctave } from "../piano-octave";
import { DefaultPianoRootConfiguration } from "../../piano/PianoRootConfiguration";

describe("piano-octave release midi signal", () => {
  it("sends NoteOn on press and NoteOff on release", () => {
    const octave = new PianoOctave();
    octave.options = DefaultPianoRootConfiguration.octaves[0];

    const statuses: MidiStatus[] = [];

    (octave as unknown as {
      midiPlayer: { play: (message: { status: MidiStatus }) => void };
    }).midiPlayer = {
      play: (message: { status: MidiStatus }) => {
        statuses.push(message.status);
      },
    };

    const tangentC = octave.options.tangent.C;

    (octave as unknown as {
      startHold: (pointerId: number, tangent: typeof tangentC) => unknown;
    }).startHold(1, tangentC);

    (octave as unknown as {
      endHold: (pointerId: number) => unknown;
    }).endHold(1);

    expect(statuses).toEqual([MidiStatus.NoteOn, MidiStatus.NoteOff]);
  });
});
