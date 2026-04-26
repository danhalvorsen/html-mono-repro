// FILE: modules/parts/oscillators/music-core-synthesizer-oscillators-contracts/tests/tests.test.ts

import { describe, expect, it } from "vitest";

import {
  OscillatorKind,
  OscillatorWaveformKind,
  type AudioSampleValue,
  type IBasicOscillatorDefinition,
  type IOscillator,
  type IOscillatorFactory,
  type IOscillatorNoteOffRequest,
  type IOscillatorNoteOnRequest,
  type IOscillatorSample,
  type IOscillatorSampleRequest,
  type IOscillatorStateSnapshot,
  type IPulseOscillatorDefinition,
  type ISampleOscillatorDefinition,
  type IWavetableOscillatorDefinition,
  type OscillatorDefinition,
} from "../src/code.js";

class OscillatorContractsFixture {
  public createBasicDefinition(): IBasicOscillatorDefinition {
    return {
      kind: OscillatorKind.Basic,
      waveform: OscillatorWaveformKind.Sawtooth,
      frequencyHz: 440,
      detuneCents: 0,
      phaseRadians: 0,
      gain: 1,
    };
  }

  public createPulseDefinition(): IPulseOscillatorDefinition {
    return {
      kind: OscillatorKind.Pulse,
      frequencyHz: 110,
      detuneCents: -12,
      phaseRadians: Math.PI,
      gain: 0.75,
      pulseWidth: 0.5,
    };
  }

  public createWavetableDefinition(): IWavetableOscillatorDefinition {
    return {
      kind: OscillatorKind.Wavetable,
      tableId: "supersaw-table",
      frequencyHz: 220,
      detuneCents: 3,
      phaseRadians: 0,
      gain: 0.8,
    };
  }

  public createSampleDefinition(): ISampleOscillatorDefinition {
    return {
      kind: OscillatorKind.Sample,
      sampleId: "sample-kick-001",
      rootFrequencyHz: 440,
      playbackFrequencyHz: 880,
      gain: 0.6,
      loop: false,
    };
  }
}

class TestOscillator implements IOscillator {
  private active = false;
  private currentFrequencyHz: number;
  private currentSampleValue: AudioSampleValue = 0;

  public constructor(public readonly definition: OscillatorDefinition) {
    this.currentFrequencyHz =
      definition.kind === OscillatorKind.Sample
        ? definition.playbackFrequencyHz
        : definition.frequencyHz;
  }

  public noteOn(request: IOscillatorNoteOnRequest): void {
    this.active = true;
    this.currentFrequencyHz = request.frequencyHz;
    this.currentSampleValue = request.velocity;
  }

  public noteOff(_request: IOscillatorNoteOffRequest): void {
    this.active = false;
  }

  public sample(request: IOscillatorSampleRequest): IOscillatorSample {
    return {
      timeSeconds: request.timeSeconds,
      value: this.currentSampleValue,
    };
  }

  public snapshot(): IOscillatorStateSnapshot {
    return {
      definition: this.definition,
      frequencyHz: this.currentFrequencyHz,
      detuneCents:
        this.definition.kind === OscillatorKind.Sample
          ? 0
          : this.definition.detuneCents,
      phaseRadians:
        this.definition.kind === OscillatorKind.Sample
          ? 0
          : this.definition.phaseRadians,
      gain: this.definition.gain,
      isActive: this.active,
    };
  }

  public reset(): void {
    this.active = false;
    this.currentSampleValue = 0;
  }
}

class TestOscillatorFactory implements IOscillatorFactory {
  public create(definition: OscillatorDefinition): IOscillator {
    return new TestOscillator(definition);
  }
}

function getOscillatorIdentity(definition: OscillatorDefinition): string {
  switch (definition.kind) {
    case OscillatorKind.Basic:
      return `${definition.kind}:${definition.waveform}:${definition.frequencyHz}`;

    case OscillatorKind.Pulse:
      return `${definition.kind}:${definition.pulseWidth}:${definition.frequencyHz}`;

    case OscillatorKind.Wavetable:
      return `${definition.kind}:${definition.tableId}:${definition.frequencyHz}`;

    case OscillatorKind.Sample:
      return `${definition.kind}:${definition.sampleId}:${definition.playbackFrequencyHz}`;
  }
}

describe("music-core-synthesizer-oscillators-contracts", () => {
  describe("constant contracts", () => {
    it("should expose stable oscillator kind values", () => {
      expect(OscillatorKind.Basic).toBe("basic");
      expect(OscillatorKind.Pulse).toBe("pulse");
      expect(OscillatorKind.Wavetable).toBe("wavetable");
      expect(OscillatorKind.Sample).toBe("sample");
    });

    it("should expose stable waveform kind values", () => {
      expect(OscillatorWaveformKind.Sine).toBe("sine");
      expect(OscillatorWaveformKind.Square).toBe("square");
      expect(OscillatorWaveformKind.Sawtooth).toBe("sawtooth");
      expect(OscillatorWaveformKind.Triangle).toBe("triangle");
    });
  });

  describe("definition contracts", () => {
    it("should allow a basic oscillator definition", () => {
      const fixture = new OscillatorContractsFixture();

      const definition = fixture.createBasicDefinition() satisfies IBasicOscillatorDefinition;

      expect(definition.kind).toBe(OscillatorKind.Basic);
      expect(definition.waveform).toBe(OscillatorWaveformKind.Sawtooth);
      expect(definition.frequencyHz).toBe(440);
      expect(definition.detuneCents).toBe(0);
      expect(definition.phaseRadians).toBe(0);
      expect(definition.gain).toBe(1);
    });

    it("should allow a pulse oscillator definition with pulse width", () => {
      const fixture = new OscillatorContractsFixture();

      const definition = fixture.createPulseDefinition() satisfies IPulseOscillatorDefinition;

      expect(definition.kind).toBe(OscillatorKind.Pulse);
      expect(definition.frequencyHz).toBe(110);
      expect(definition.detuneCents).toBe(-12);
      expect(definition.phaseRadians).toBe(Math.PI);
      expect(definition.gain).toBe(0.75);
      expect(definition.pulseWidth).toBe(0.5);
    });

    it("should allow a wavetable oscillator definition with table id", () => {
      const fixture = new OscillatorContractsFixture();

      const definition =
        fixture.createWavetableDefinition() satisfies IWavetableOscillatorDefinition;

      expect(definition.kind).toBe(OscillatorKind.Wavetable);
      expect(definition.tableId).toBe("supersaw-table");
      expect(definition.frequencyHz).toBe(220);
      expect(definition.detuneCents).toBe(3);
      expect(definition.phaseRadians).toBe(0);
      expect(definition.gain).toBe(0.8);
    });

    it("should allow a sample oscillator definition with sample playback frequencies", () => {
      const fixture = new OscillatorContractsFixture();

      const definition = fixture.createSampleDefinition() satisfies ISampleOscillatorDefinition;

      expect(definition.kind).toBe(OscillatorKind.Sample);
      expect(definition.sampleId).toBe("sample-kick-001");
      expect(definition.rootFrequencyHz).toBe(440);
      expect(definition.playbackFrequencyHz).toBe(880);
      expect(definition.gain).toBe(0.6);
      expect(definition.loop).toBe(false);
    });

    it("should discriminate oscillator definitions by kind", () => {
      const fixture = new OscillatorContractsFixture();

      expect(getOscillatorIdentity(fixture.createBasicDefinition())).toBe(
        "basic:sawtooth:440",
      );

      expect(getOscillatorIdentity(fixture.createPulseDefinition())).toBe(
        "pulse:0.5:110",
      );

      expect(getOscillatorIdentity(fixture.createWavetableDefinition())).toBe(
        "wavetable:supersaw-table:220",
      );

      expect(getOscillatorIdentity(fixture.createSampleDefinition())).toBe(
        "sample:sample-kick-001:880",
      );
    });
  });

  describe("oscillator behavior contracts", () => {
    it("should allow an oscillator implementation to follow the contract", () => {
      const fixture = new OscillatorContractsFixture();
      const oscillator = new TestOscillator(fixture.createBasicDefinition());

      oscillator.noteOn({
        timeSeconds: 0,
        frequencyHz: 880,
        velocity: 0.7,
      });

      const sample = oscillator.sample({
        timeSeconds: 0.25,
        sampleRateHz: 48_000,
      });

      const snapshot = oscillator.snapshot();

      expect(sample.timeSeconds).toBe(0.25);
      expect(sample.value).toBe(0.7);
      expect(snapshot.frequencyHz).toBe(880);
      expect(snapshot.isActive).toBe(true);

      oscillator.noteOff({
        timeSeconds: 0.5,
      });

      expect(oscillator.snapshot().isActive).toBe(false);
    });

    it("should allow an oscillator factory implementation to create oscillators", () => {
      const fixture = new OscillatorContractsFixture();
      const factory = new TestOscillatorFactory();

      const oscillator = factory.create(fixture.createPulseDefinition());

      expect(oscillator.definition.kind).toBe(OscillatorKind.Pulse);
      expect(oscillator.snapshot().frequencyHz).toBe(110);
      expect(oscillator.snapshot().gain).toBe(0.75);
    });

    it("should allow an oscillator implementation to reset runtime state", () => {
      const fixture = new OscillatorContractsFixture();
      const oscillator = new TestOscillator(fixture.createBasicDefinition());

      oscillator.noteOn({
        timeSeconds: 0,
        frequencyHz: 440,
        velocity: 1,
      });

      expect(oscillator.snapshot().isActive).toBe(true);

      oscillator.reset();

      expect(oscillator.snapshot().isActive).toBe(false);
      expect(
        oscillator.sample({
          timeSeconds: 1,
          sampleRateHz: 48_000,
        }).value,
      ).toBe(0);
    });
  });
});