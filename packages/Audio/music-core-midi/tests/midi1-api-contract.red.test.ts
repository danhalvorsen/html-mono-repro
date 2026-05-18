import { describe, expect, it } from "vitest";
import * as midiApi from "../src/index.js";

describe("RED: MIDI 1.0 high-level API contract declaration", () => {
  it("exports MIDI1 namespace/type-group", () => {
    expect(midiApi).toHaveProperty("MIDI1");
  });

  it("exports high-level interface/factory", () => {
    expect(midiApi).toHaveProperty("createMidi1HighLevelInterface");
    expect(midiApi).toHaveProperty("IMidi1HighLevelInterfaceSymbol");
  });

  it("exports strict validator helpers for MMA ranges", () => {
    expect(midiApi).toHaveProperty("assertMidi1Channel");
    expect(midiApi).toHaveProperty("assertMidi1Value7Bit");
    expect(midiApi).toHaveProperty("assertMidi1PitchBend14Bit");
  });

  it("exports type guards for every standard event payload", () => {
    expect(midiApi).toHaveProperty("isMidi1NoteEvent");
    expect(midiApi).toHaveProperty("isMidi1ControlChangeEvent");
    expect(midiApi).toHaveProperty("isMidi1PitchBendEvent");
    expect(midiApi).toHaveProperty("isMidi1ProgramChangeEvent");
  });

  it("exports metadata for strict numeric domains", () => {
    expect(midiApi).toHaveProperty("MIDI1ChannelMin");
    expect(midiApi).toHaveProperty("MIDI1ChannelMax");
    expect(midiApi).toHaveProperty("MIDI1Value7BitMin");
    expect(midiApi).toHaveProperty("MIDI1Value7BitMax");
    expect(midiApi).toHaveProperty("MIDI1PitchBend14BitMin");
    expect(midiApi).toHaveProperty("MIDI1PitchBend14BitCenter");
    expect(midiApi).toHaveProperty("MIDI1PitchBend14BitMax");
  });

  it("exports standard realtime signal set", () => {
    expect(midiApi).toHaveProperty("MIDI1ClockSignals");
  });

  it("exports channel-wide utility CC constants", () => {
    expect(midiApi).toHaveProperty("MIDI1AllNotesOffCC");
    expect(midiApi).toHaveProperty("MIDI1AllSoundOffCC");
    expect(midiApi).toHaveProperty("MIDI1ResetAllControllersCC");
  });

  it("exports listener method name contract", () => {
    expect(midiApi).toHaveProperty("MIDI1ListenerMethodNames");
    expect(midiApi).toHaveProperty("MIDI1ListenerMethodNames.onNoteOn");
    expect(midiApi).toHaveProperty("MIDI1ListenerMethodNames.onNoteOff");
    expect(midiApi).toHaveProperty("MIDI1ListenerMethodNames.onControlChange");
    expect(midiApi).toHaveProperty("MIDI1ListenerMethodNames.onPitchBend");
    expect(midiApi).toHaveProperty("MIDI1ListenerMethodNames.onProgramChange");
  });

  it("exports sender method name contract", () => {
    expect(midiApi).toHaveProperty("MIDI1SenderMethodNames");
    expect(midiApi).toHaveProperty("MIDI1SenderMethodNames.sendNoteOn");
    expect(midiApi).toHaveProperty("MIDI1SenderMethodNames.sendNoteOff");
    expect(midiApi).toHaveProperty("MIDI1SenderMethodNames.sendControlChange");
    expect(midiApi).toHaveProperty("MIDI1SenderMethodNames.sendPitchBend");
    expect(midiApi).toHaveProperty("MIDI1SenderMethodNames.sendProgramChange");
    expect(midiApi).toHaveProperty("MIDI1SenderMethodNames.sendClockSignal");
    expect(midiApi).toHaveProperty("MIDI1SenderMethodNames.sendAllNotesOff");
    expect(midiApi).toHaveProperty("MIDI1SenderMethodNames.sendAllSoundOff");
    expect(midiApi).toHaveProperty("MIDI1SenderMethodNames.sendResetAllControllers");
  });
});
