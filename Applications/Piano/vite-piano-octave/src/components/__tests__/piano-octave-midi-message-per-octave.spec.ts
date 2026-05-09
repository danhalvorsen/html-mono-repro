import { describe, expect, it } from "vitest";
import { MidiStatus } from "@monorepo/music-core-midi";
import { PianoRootConfigurationFactory } from "../PianoRootConfiguration";
import { PianoOctave } from "../piano-octave";

describe("piano-octave midi message dispatch", () => {
  it("sends consistent NoteOn contract to player for any octave option", () => {
    const configuration = new PianoRootConfigurationFactory().create({
      octaveCount: 2,
      rootPosition: { x: 0, y: 0 },
      octaveSize: { x: 300, y: (300 * 150) / 164.5 },
      octaveStartPosition: { x: 0, y: (300 * 150) / 164.5 },
      octaveGap: 6,
      waterfallPosition: { x: 0, y: 0 },
      waterfallHeightRatioToOctaveHeight: 1,
      maxSimultaneousOctaves: 2,
      midiTempoBpm: 130,
      playbackSpeed: 1,
      midiSignalRate: 1,
    });

    for (const octaveOptions of configuration.octaves) {
      const octave = new PianoOctave();
      octave.options = octaveOptions;

      const captured: unknown[] = [];
      (octave as unknown as { midiPlayer: { play: (message: unknown) => void } }).midiPlayer = {
        play: (message: unknown) => captured.push(message),
      };

      const tangentC = octaveOptions.tangent.C;
      (octave as unknown as {
        startHold: (pointerId: number, tangent: typeof tangentC) => unknown;
      }).startHold(1, tangentC);

      expect(captured.length).toBe(1);
      const message = captured[0] as {
        status: MidiStatus;
        note: { value: () => number };
        velocity: { value: () => number };
        channel: { value: () => number };
      };

      expect(message.status).toBe(MidiStatus.NoteOn);
      expect(message.channel.value()).toBe(octaveOptions.octaveIndex);
      expect(message.velocity.value()).toBe(100);
      expect(message.note.value()).toBe((tangentC.midiNote ?? 0) + 24);
    }
  });
});
