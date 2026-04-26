import { describe, expect, it } from "vitest";

import {
  OscillatorKind,
  OscillatorWaveformKind,
  type IBasicOscillatorDefinition,
  type IPulseOscillatorDefinition,
  type ISampleOscillatorDefinition,
  type IWavetableOscillatorDefinition,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";

import {
  OscillatorWaveformMapper,
  WebAudioOscillatorDefinitionValidator,
  WebAudioOscillatorGraphFactory,
  type IWebAudioAudioBufferLike,
  type IWebAudioAudioParamLike,
  type IWebAudioBufferSourceNodeLike,
  type IWebAudioConnectable,
  type IWebAudioContextLike,
  type IWebAudioGainNodeLike,
  type IWebAudioOscillatorNodeLike,
  type IWebAudioPeriodicWaveLike,
  type IWebAudioSampleBufferProvider,
  type IWebAudioWavetableProvider,
  type WebAudioOscillatorTypeValue,
} from "../src/index.js";

class FakeAudioParam implements IWebAudioAudioParamLike {
  public value = 0;
  public readonly events: Array<{ readonly value: number; readonly time: number }> = [];

  public setValueAtTime(value: number, startTime: number): void {
    this.value = value;
    this.events.push({
      value,
      time: startTime,
    });
  }
}

class FakeAudioNode implements IWebAudioConnectable {
  public readonly connections: IWebAudioConnectable[] = [];
  public disconnected = false;

  public connect(destination: IWebAudioConnectable): unknown {
    this.connections.push(destination);
    return destination;
  }

  public disconnect(): void {
    this.disconnected = true;
    this.connections.length = 0;
  }
}

class FakeGainNode extends FakeAudioNode implements IWebAudioGainNodeLike {
  public readonly gain = new FakeAudioParam();
}

class FakeOscillatorNode extends FakeAudioNode implements IWebAudioOscillatorNodeLike {
  public type: WebAudioOscillatorTypeValue = "sine";
  public readonly frequency = new FakeAudioParam();
  public readonly detune = new FakeAudioParam();
  public readonly startedAt: number[] = [];
  public readonly stoppedAt: number[] = [];
  public periodicWave: IWebAudioPeriodicWaveLike | null = null;

  public start(when: number): void {
    this.startedAt.push(when);
  }

  public stop(when: number): void {
    this.stoppedAt.push(when);
  }

  public setPeriodicWave(periodicWave: IWebAudioPeriodicWaveLike): void {
    this.periodicWave = periodicWave;
  }
}

class FakeBufferSourceNode extends FakeAudioNode implements IWebAudioBufferSourceNodeLike {
  public buffer: IWebAudioAudioBufferLike | null = null;
  public loop = false;
  public readonly playbackRate = new FakeAudioParam();
  public readonly startedAt: number[] = [];
  public readonly stoppedAt: number[] = [];

  public start(when: number): void {
    this.startedAt.push(when);
  }

  public stop(when: number): void {
    this.stoppedAt.push(when);
  }
}

class FakeWebAudioContext implements IWebAudioContextLike {
  public readonly sampleRate = 48_000;
  public readonly gainNodes: FakeGainNode[] = [];
  public readonly oscillatorNodes: FakeOscillatorNode[] = [];
  public readonly bufferSourceNodes: FakeBufferSourceNode[] = [];

  public createGain(): IWebAudioGainNodeLike {
    const node = new FakeGainNode();
    this.gainNodes.push(node);
    return node;
  }

  public createOscillator(): IWebAudioOscillatorNodeLike {
    const node = new FakeOscillatorNode();
    this.oscillatorNodes.push(node);
    return node;
  }

  public createBufferSource(): IWebAudioBufferSourceNodeLike {
    const node = new FakeBufferSourceNode();
    this.bufferSourceNodes.push(node);
    return node;
  }
}

class FakeWavetableProvider implements IWebAudioWavetableProvider {
  public get(tableId: string): IWebAudioPeriodicWaveLike {
    return {
      id: tableId,
    };
  }
}

class FakeSampleBufferProvider implements IWebAudioSampleBufferProvider {
  public get(sampleId: string): IWebAudioAudioBufferLike {
    return {
      id: sampleId,
    };
  }
}

class OscillatorWebAudioFixture {
  public createBasicDefinition(): IBasicOscillatorDefinition {
    return {
      kind: OscillatorKind.Basic,
      waveform: OscillatorWaveformKind.Sawtooth,
      frequencyHz: 440,
      detuneCents: 12,
      phaseRadians: 0,
      gain: 0.8,
    };
  }

  public createPulseDefinition(): IPulseOscillatorDefinition {
    return {
      kind: OscillatorKind.Pulse,
      frequencyHz: 110,
      detuneCents: -5,
      phaseRadians: 0,
      gain: 0.5,
      pulseWidth: 0.5,
    };
  }

  public createWavetableDefinition(): IWavetableOscillatorDefinition {
    return {
      kind: OscillatorKind.Wavetable,
      tableId: "table-alpha",
      frequencyHz: 220,
      detuneCents: 0,
      phaseRadians: 0,
      gain: 0.7,
    };
  }

  public createSampleDefinition(): ISampleOscillatorDefinition {
    return {
      kind: OscillatorKind.Sample,
      sampleId: "sample-alpha",
      rootFrequencyHz: 440,
      playbackFrequencyHz: 440,
      gain: 0.9,
      loop: true,
    };
  }

  public createFactory(context: FakeWebAudioContext): WebAudioOscillatorGraphFactory {
    return new WebAudioOscillatorGraphFactory({
      context,
      definitionValidator: new WebAudioOscillatorDefinitionValidator(),
      wavetableProvider: new FakeWavetableProvider(),
      sampleBufferProvider: new FakeSampleBufferProvider(),
    });
  }
}

describe("music-core-synthesizer-oscillators-web-audio", () => {
  describe("mapping", () => {
    it("should map contract waveform kinds to Web Audio oscillator types", () => {
      const mapper = new OscillatorWaveformMapper();

      expect(mapper.map(OscillatorWaveformKind.Sine)).toBe("sine");
      expect(mapper.map(OscillatorWaveformKind.Square)).toBe("square");
      expect(mapper.map(OscillatorWaveformKind.Sawtooth)).toBe("sawtooth");
      expect(mapper.map(OscillatorWaveformKind.Triangle)).toBe("triangle");
    });
  });

  describe("validation", () => {
    it("should allow valid oscillator definitions", () => {
      const fixture = new OscillatorWebAudioFixture();
      const validator = new WebAudioOscillatorDefinitionValidator();

      expect(() => validator.validate(fixture.createBasicDefinition())).not.toThrow();
      expect(() => validator.validate(fixture.createPulseDefinition())).not.toThrow();
      expect(() => validator.validate(fixture.createWavetableDefinition())).not.toThrow();
      expect(() => validator.validate(fixture.createSampleDefinition())).not.toThrow();
    });

    it("should reject invalid frequency", () => {
      const fixture = new OscillatorWebAudioFixture();
      const validator = new WebAudioOscillatorDefinitionValidator();

      const invalid = {
        ...fixture.createBasicDefinition(),
        frequencyHz: 0,
      };

      expect(() => validator.validate(invalid)).toThrow("frequencyHz");
    });

    it("should reject invalid pulse width", () => {
      const fixture = new OscillatorWebAudioFixture();
      const validator = new WebAudioOscillatorDefinitionValidator();

      const invalid = {
        ...fixture.createPulseDefinition(),
        pulseWidth: 2,
      };

      expect(() => validator.validate(invalid)).toThrow("pulseWidth");
    });
  });

  describe("basic oscillator graph", () => {
    it("should create and start a basic oscillator source", () => {
      const fixture = new OscillatorWebAudioFixture();
      const context = new FakeWebAudioContext();

      const graph = fixture
        .createFactory(context)
        .create(fixture.createBasicDefinition());

      graph.noteOn({
        timeSeconds: 1,
        frequencyHz: 880,
        velocity: 0.5,
      });

      const oscillator = context.oscillatorNodes[0];

      expect(oscillator).toBeDefined();
      expect(oscillator?.type).toBe("sawtooth");
      expect(oscillator?.frequency.value).toBe(880);
      expect(oscillator?.detune.value).toBe(12);
      expect(oscillator?.startedAt).toEqual([1]);
      expect(context.gainNodes[0]?.gain.value).toBe(0.4);
      expect(graph.snapshot().isActive).toBe(true);
      expect(graph.snapshot().frequencyHz).toBe(880);
    });

    it("should stop active oscillator on note-off", () => {
      const fixture = new OscillatorWebAudioFixture();
      const context = new FakeWebAudioContext();

      const graph = fixture
        .createFactory(context)
        .create(fixture.createBasicDefinition());

      graph.noteOn({
        timeSeconds: 0,
        frequencyHz: 440,
        velocity: 1,
      });

      graph.noteOff({
        timeSeconds: 2,
      });

      expect(context.oscillatorNodes[0]?.stoppedAt).toEqual([2]);
      expect(context.oscillatorNodes[0]?.disconnected).toBe(true);
      expect(graph.snapshot().isActive).toBe(false);
    });
  });

  describe("pulse oscillator graph", () => {
    it("should approximate pulse oscillator with square oscillator source", () => {
      const fixture = new OscillatorWebAudioFixture();
      const context = new FakeWebAudioContext();

      const graph = fixture
        .createFactory(context)
        .create(fixture.createPulseDefinition());

      graph.noteOn({
        timeSeconds: 0,
        frequencyHz: 110,
        velocity: 1,
      });

      expect(context.oscillatorNodes[0]?.type).toBe("square");
      expect(context.oscillatorNodes[0]?.frequency.value).toBe(110);
      expect(context.oscillatorNodes[0]?.detune.value).toBe(-5);
    });
  });

  describe("wavetable oscillator graph", () => {
    it("should set periodic wave from wavetable provider", () => {
      const fixture = new OscillatorWebAudioFixture();
      const context = new FakeWebAudioContext();

      const graph = fixture
        .createFactory(context)
        .create(fixture.createWavetableDefinition());

      graph.noteOn({
        timeSeconds: 0,
        frequencyHz: 330,
        velocity: 1,
      });

      expect(context.oscillatorNodes[0]?.periodicWave).toEqual({
        id: "table-alpha",
      });

      expect(context.oscillatorNodes[0]?.frequency.value).toBe(330);
    });
  });

  describe("sample oscillator graph", () => {
    it("should create buffer source and configure playback rate", () => {
      const fixture = new OscillatorWebAudioFixture();
      const context = new FakeWebAudioContext();

      const graph = fixture
        .createFactory(context)
        .create(fixture.createSampleDefinition());

      graph.noteOn({
        timeSeconds: 0,
        frequencyHz: 880,
        velocity: 1,
      });

      const source = context.bufferSourceNodes[0];

      expect(source?.buffer).toEqual({
        id: "sample-alpha",
      });

      expect(source?.loop).toBe(true);
      expect(source?.playbackRate.value).toBe(2);
      expect(source?.startedAt).toEqual([0]);
    });
  });

  describe("graph operations", () => {
    it("should connect and disconnect output node", () => {
      const fixture = new OscillatorWebAudioFixture();
      const context = new FakeWebAudioContext();
      const destination = new FakeGainNode();

      const graph = fixture
        .createFactory(context)
        .create(fixture.createBasicDefinition());

      graph.connect(destination);
      graph.disconnect();

      expect(context.gainNodes[0]?.disconnected).toBe(true);
    });

    it("should reset active source and restore definition gain", () => {
      const fixture = new OscillatorWebAudioFixture();
      const context = new FakeWebAudioContext();

      const graph = fixture
        .createFactory(context)
        .create(fixture.createBasicDefinition());

      graph.noteOn({
        timeSeconds: 0,
        frequencyHz: 440,
        velocity: 0.5,
      });

      graph.reset();

      expect(context.oscillatorNodes[0]?.stoppedAt).toEqual([0]);
      expect(context.oscillatorNodes[0]?.disconnected).toBe(true);
      expect(context.gainNodes[0]?.gain.value).toBe(0.8);
      expect(graph.snapshot().isActive).toBe(false);
    });

    it("should reject invalid note-on velocity", () => {
      const fixture = new OscillatorWebAudioFixture();
      const context = new FakeWebAudioContext();

      const graph = fixture
        .createFactory(context)
        .create(fixture.createBasicDefinition());

      expect(() =>
        graph.noteOn({
          timeSeconds: 0,
          frequencyHz: 440,
          velocity: 2,
        }),
      ).toThrow("velocity must be between 0 and 1");
    });

    it("should expose a deterministic non-DSP sample placeholder", () => {
      const fixture = new OscillatorWebAudioFixture();
      const context = new FakeWebAudioContext();

      const graph = fixture
        .createFactory(context)
        .create(fixture.createBasicDefinition());

      expect(
        graph.sample({
          timeSeconds: 0,
          sampleRateHz: 48_000,
        }),
      ).toEqual({
        timeSeconds: 0,
        value: 0,
      });
    });
  });
});
