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