import { describe, expect, it } from "vitest";
import * as accordsPlayback from "../src/index.js";

describe("RED: MIDI 1.0 high-level API implementation compliance", () => {
  it("exports a dedicated high-level MIDI implementation class", () => {
    expect(accordsPlayback).toHaveProperty("Midi1HighLevelPlayback");
  });

  it("exports an implementation factory", () => {
    expect(accordsPlayback).toHaveProperty("createMidi1HighLevelPlayback");
  });

  it("exports implementation capability metadata", () => {
    expect(accordsPlayback).toHaveProperty("MIDI1ImplementationCapabilities");
  });

  it("implements inbound listeners", () => {
    const candidate = (accordsPlayback as Record<string, unknown>).Midi1HighLevelPlayback as
      | { new (): Record<string, unknown> }
      | undefined;

    expect(candidate).toBeTypeOf("function");

    const instance = new candidate!();
    expect(instance).toHaveProperty("onNoteOn");
    expect(instance).toHaveProperty("onNoteOff");
    expect(instance).toHaveProperty("onControlChange");
    expect(instance).toHaveProperty("onPitchBend");
    expect(instance).toHaveProperty("onProgramChange");
  });

  it("implements outbound performance commands", () => {
    const candidate = (accordsPlayback as Record<string, unknown>).Midi1HighLevelPlayback as
      | { new (): Record<string, unknown> }
      | undefined;
    expect(candidate).toBeTypeOf("function");
    const instance = new candidate!();
    expect(instance).toHaveProperty("sendNoteOn");
    expect(instance).toHaveProperty("sendNoteOff");
    expect(instance).toHaveProperty("sendControlChange");
    expect(instance).toHaveProperty("sendPitchBend");
    expect(instance).toHaveProperty("sendProgramChange");
  });

  it("enforces strict channel and value constraints on note commands", () => {
    const candidate = (accordsPlayback as Record<string, unknown>).Midi1HighLevelPlayback as
      | { new (): Record<string, unknown> }
      | undefined;
    expect(candidate).toBeTypeOf("function");
    const instance = new candidate!() as Record<string, (...args: unknown[]) => unknown>;

    expect(() => instance.sendNoteOn("port-a", 0, 60, 100)).toThrow();
    expect(() => instance.sendNoteOff("port-a", 1, 200, 0)).toThrow();
    expect(() => instance.sendNoteOn("port-a", 1, 60, 200)).toThrow();
  });

  it("enforces strict range on control/pitch/program commands", () => {
    const candidate = (accordsPlayback as Record<string, unknown>).Midi1HighLevelPlayback as
      | { new (): Record<string, unknown> }
      | undefined;
    expect(candidate).toBeTypeOf("function");
    const instance = new candidate!() as Record<string, (...args: unknown[]) => unknown>;

    expect(() => instance.sendControlChange("port-a", 1, 200, 0)).toThrow();
    expect(() => instance.sendControlChange("port-a", 1, 64, 200)).toThrow();
    expect(() => instance.sendPitchBend("port-a", 1, 20000)).toThrow();
    expect(() => instance.sendProgramChange("port-a", 1, 200)).toThrow();
  });

  it("implements realtime clock/timing signals", () => {
    const candidate = (accordsPlayback as Record<string, unknown>).Midi1HighLevelPlayback as
      | { new (): Record<string, unknown> }
      | undefined;
    expect(candidate).toBeTypeOf("function");
    const instance = new candidate!();
    expect(instance).toHaveProperty("sendClockSignal");
  });

  it("supports all clock signal literals", () => {
    const candidate = (accordsPlayback as Record<string, unknown>).Midi1HighLevelPlayback as
      | { new (): Record<string, unknown> }
      | undefined;
    expect(candidate).toBeTypeOf("function");
    const instance = new candidate!() as Record<string, (...args: unknown[]) => unknown>;

    expect(() => instance.sendClockSignal("port-a", "clock")).not.toThrow();
    expect(() => instance.sendClockSignal("port-a", "start")).not.toThrow();
    expect(() => instance.sendClockSignal("port-a", "stop")).not.toThrow();
    expect(() => instance.sendClockSignal("port-a", "continue")).not.toThrow();
  });

  it("implements channel utility commands", () => {
    const candidate = (accordsPlayback as Record<string, unknown>).Midi1HighLevelPlayback as
      | { new (): Record<string, unknown> }
      | undefined;
    expect(candidate).toBeTypeOf("function");
    const instance = new candidate!();
    expect(instance).toHaveProperty("sendAllNotesOff");
    expect(instance).toHaveProperty("sendAllSoundOff");
    expect(instance).toHaveProperty("sendResetAllControllers");
  });

  it("maps utility commands to MMA CC numbers 123/120/121", () => {
    const candidate = (accordsPlayback as Record<string, unknown>).Midi1HighLevelPlayback as
      | { new (): Record<string, unknown> }
      | undefined;
    expect(candidate).toBeTypeOf("function");
    const instance = new candidate!() as Record<string, unknown>;

    expect(instance).toHaveProperty("MIDI1AllNotesOffCC", 123);
    expect(instance).toHaveProperty("MIDI1AllSoundOffCC", 120);
    expect(instance).toHaveProperty("MIDI1ResetAllControllersCC", 121);
  });
});
