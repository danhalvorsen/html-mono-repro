import { describe, expect, it } from "vitest";

import {
  EnvelopeCurveKind,
  EnvelopeKind,
  type IAdsrEnvelopeDefinition,
  type IAhdsrEnvelopeDefinition,
  type IOneShotEnvelopeDefinition,
} from "@monorepo/music-core-synthesizer-envelopes-contracts";

import {
  EnvelopeAutomationScheduler,
  WebAudioEnvelopeGainGraphFactory,
  WebAudioEnvelopeMath,
  type IWebAudioAudioParamLike,
  type IWebAudioConnectable,
  type IWebAudioContextLike,
  type IWebAudioGainNodeLike,
} from "../src/index.js";

type FakeAutomationEvent =
  | {
      readonly kind: "cancel";
      readonly time: number;
      readonly value: null;
      readonly timeConstant: null;
    }
  | {
      readonly kind: "set";
      readonly time: number;
      readonly value: number;
      readonly timeConstant: null;
    }
  | {
      readonly kind: "linear";
      readonly time: number;
      readonly value: number;
      readonly timeConstant: null;
    }
  | {
      readonly kind: "target";
      readonly time: number;
      readonly value: number;
      readonly timeConstant: number;
    };

class FakeAudioParam implements IWebAudioAudioParamLike {
  public value = 0;
  public readonly events: FakeAutomationEvent[] = [];

  public cancelScheduledValues(startTime: number): void {
    this.events.push({
      kind: "cancel",
      time: startTime,
      value: null,
      timeConstant: null,
    });
  }

  public setValueAtTime(value: number, startTime: number): void {
    this.value = value;
    this.events.push({
      kind: "set",
      time: startTime,
      value,
      timeConstant: null,
    });
  }

  public linearRampToValueAtTime(value: number, endTime: number): void {
    this.value = value;
    this.events.push({
      kind: "linear",
      time: endTime,
      value,
      timeConstant: null,
    });
  }

  public setTargetAtTime(
    target: number,
    startTime: number,
    timeConstant: number,
  ): void {
    this.value = target;
    this.events.push({
      kind: "target",
      time: startTime,
      value: target,
      timeConstant,
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

class FakeWebAudioContext implements IWebAudioContextLike {
  public readonly sampleRate = 48_000;
  public readonly gainNodes: FakeGainNode[] = [];

  public createGain(): IWebAudioGainNodeLike {
    const node = new FakeGainNode();
    this.gainNodes.push(node);
    return node;
  }
}

class EnvelopeWebAudioFixture {
  public readonly linearCurve = {
    kind: EnvelopeCurveKind.Linear,
  } as const;

  public readonly exponentialCurve = {
    kind: EnvelopeCurveKind.Exponential,
  } as const;

  public createAdsrDefinition(): IAdsrEnvelopeDefinition {
    return {
      kind: EnvelopeKind.Adsr,
      attackSeconds: 1,
      decaySeconds: 1,
      sustainLevel: 0.5,
      releaseSeconds: 1,
      attackCurve: this.linearCurve,
      decayCurve: this.linearCurve,
      releaseCurve: this.linearCurve,
    };
  }

  public createAhdsrDefinition(): IAhdsrEnvelopeDefinition {
    return {
      kind: EnvelopeKind.Ahdsr,
      attackSeconds: 1,
      holdSeconds: 1,
      decaySeconds: 1,
      sustainLevel: 0.5,
      releaseSeconds: 1,
      attackCurve: this.linearCurve,
      decayCurve: this.linearCurve,
      releaseCurve: this.linearCurve,
    };
  }

  public createExponentialAdsrDefinition(): IAdsrEnvelopeDefinition {
    return {
      ...this.createAdsrDefinition(),
      attackCurve: this.exponentialCurve,
    };
  }

  public createOneShotDefinition(): IOneShotEnvelopeDefinition {
    return {
      kind: EnvelopeKind.OneShot,
      attackSeconds: 1,
      decaySeconds: 1,
      attackCurve: this.linearCurve,
      decayCurve: this.linearCurve,
    };
  }
}

describe("music-core-synthesizer-envelopes-web-audio", () => {
  describe("math", () => {
    it("should clamp levels to unipolar range", () => {
      expect(WebAudioEnvelopeMath.clamp01(-1)).toBe(0);
      expect(WebAudioEnvelopeMath.clamp01(0.25)).toBe(0.25);
      expect(WebAudioEnvelopeMath.clamp01(2)).toBe(1);
    });

    it("should provide safe time constants", () => {
      expect(WebAudioEnvelopeMath.safeTimeConstant(0)).toBe(0.001);
      expect(WebAudioEnvelopeMath.safeTimeConstant(1)).toBe(0.2);
    });
  });

  describe("automation scheduler", () => {
    it("should schedule ADSR gate-on automation", () => {
      const fixture = new EnvelopeWebAudioFixture();
      const parameter = new FakeAudioParam();

      EnvelopeAutomationScheduler
        .createDefault()
        .scheduleGateOn(
          fixture.createAdsrDefinition(),
          parameter,
          {
            timeSeconds: 0,
            velocity: 1,
          },
        );

      expect(parameter.events).toEqual([
        { kind: "cancel", time: 0, value: null, timeConstant: null },
        { kind: "set", time: 0, value: 0, timeConstant: null },
        { kind: "set", time: 0, value: 0, timeConstant: null },
        { kind: "linear", time: 1, value: 1, timeConstant: null },
        { kind: "set", time: 1, value: 1, timeConstant: null },
        { kind: "linear", time: 2, value: 0.5, timeConstant: null },
        { kind: "set", time: 2, value: 0.5, timeConstant: null },
      ]);
    });

 // FILE: tests/tests.test.ts

it("should schedule AHDSR hold before decay", () => {
  const fixture = new EnvelopeWebAudioFixture();
  const parameter = new FakeAudioParam();

  EnvelopeAutomationScheduler
    .createDefault()
    .scheduleGateOn(
      fixture.createAhdsrDefinition(),
      parameter,
      {
        timeSeconds: 0,
        velocity: 1,
      },
    );

  expect(parameter.events.some((event) =>
    event.kind === "set" && event.time === 2 && event.value === 1,
  )).toBe(true);

  expect(parameter.events.some((event) =>
    event.kind === "linear" && event.time === 3 && event.value === 0.5,
  )).toBe(true);
});

    it("should schedule exponential-style curves using target automation", () => {
      const fixture = new EnvelopeWebAudioFixture();
      const parameter = new FakeAudioParam();

      EnvelopeAutomationScheduler
        .createDefault()
        .scheduleGateOn(
          fixture.createExponentialAdsrDefinition(),
          parameter,
          {
            timeSeconds: 0,
            velocity: 1,
          },
        );

      expect(parameter.events.some((event) => event.kind === "target")).toBe(true);
    });

    it("should schedule release from current parameter value", () => {
      const fixture = new EnvelopeWebAudioFixture();
      const parameter = new FakeAudioParam();
      parameter.value = 0.5;

      EnvelopeAutomationScheduler
        .createDefault()
        .scheduleGateOff(
          fixture.createAdsrDefinition(),
          parameter,
          {
            timeSeconds: 10,
          },
        );

      expect(parameter.events).toContainEqual({
        kind: "set",
        time: 10,
        value: 0.5,
        timeConstant: null,
      });

      expect(parameter.events).toContainEqual({
        kind: "linear",
        time: 11,
        value: 0,
        timeConstant: null,
      });
    });

    it("should ignore gate-off for one-shot envelopes", () => {
      const fixture = new EnvelopeWebAudioFixture();
      const parameter = new FakeAudioParam();

      EnvelopeAutomationScheduler
        .createDefault()
        .scheduleGateOff(
          fixture.createOneShotDefinition(),
          parameter,
          {
            timeSeconds: 10,
          },
        );

      expect(parameter.events).toEqual([]);
    });

    it("should reject invalid velocity", () => {
      const fixture = new EnvelopeWebAudioFixture();
      const parameter = new FakeAudioParam();

      expect(() =>
        EnvelopeAutomationScheduler
          .createDefault()
          .scheduleGateOn(
            fixture.createAdsrDefinition(),
            parameter,
            {
              timeSeconds: 0,
              velocity: 2,
            },
          ),
      ).toThrow("velocity must be between 0 and 1");
    });
  });

  describe("gain graph", () => {
    it("should create a gain graph with gain initialized to zero", () => {
      const fixture = new EnvelopeWebAudioFixture();
      const context = new FakeWebAudioContext();

      const graph = WebAudioEnvelopeGainGraphFactory
        .createDefault(context)
        .create(fixture.createAdsrDefinition());

      expect(graph.definition.kind).toBe(EnvelopeKind.Adsr);
      expect(context.gainNodes.length).toBe(1);
      expect(context.gainNodes[0]!.gain.value).toBe(0);
    });

    it("should schedule gate-on automation through graph", () => {
      const fixture = new EnvelopeWebAudioFixture();
      const context = new FakeWebAudioContext();

      const graph = WebAudioEnvelopeGainGraphFactory
        .createDefault(context)
        .create(fixture.createAdsrDefinition());

      graph.gateOn({
        timeSeconds: 0,
        velocity: 1,
      });

      expect(context.gainNodes[0]!.gain.events.length).toBeGreaterThan(0);
      expect(context.gainNodes[0]!.gain.value).toBe(0.5);
    });

    it("should update graph definition", () => {
      const fixture = new EnvelopeWebAudioFixture();
      const context = new FakeWebAudioContext();

      const graph = WebAudioEnvelopeGainGraphFactory
        .createDefault(context)
        .create(fixture.createAdsrDefinition());

      graph.update(fixture.createOneShotDefinition());

      expect(graph.definition.kind).toBe(EnvelopeKind.OneShot);
    });

    it("should connect and disconnect graph output", () => {
      const fixture = new EnvelopeWebAudioFixture();
      const context = new FakeWebAudioContext();
      const destination = new FakeGainNode();

      const graph = WebAudioEnvelopeGainGraphFactory
        .createDefault(context)
        .create(fixture.createAdsrDefinition());

      graph.connect(destination);
      graph.disconnect();

      expect(context.gainNodes[0]!.connections.length).toBe(0);
      expect(context.gainNodes[0]!.disconnected).toBe(true);
    });

    it("should reset gain automation", () => {
      const fixture = new EnvelopeWebAudioFixture();
      const context = new FakeWebAudioContext();

      const graph = WebAudioEnvelopeGainGraphFactory
        .createDefault(context)
        .create(fixture.createAdsrDefinition());

      graph.reset(5);

      expect(context.gainNodes[0]!.gain.events).toContainEqual({
        kind: "cancel",
        time: 5,
        value: null,
        timeConstant: null,
      });

      expect(context.gainNodes[0]!.gain.events).toContainEqual({
        kind: "set",
        time: 5,
        value: 0,
        timeConstant: null,
      });
    });

    it("should reject invalid envelope definitions through contracts", () => {
      const fixture = new EnvelopeWebAudioFixture();
      const context = new FakeWebAudioContext();

      const invalid = {
        ...fixture.createAdsrDefinition(),
        sustainLevel: 2,
      };

      expect(() =>
        WebAudioEnvelopeGainGraphFactory
          .createDefault(context)
          .create(invalid),
      ).toThrow("Envelope definition is invalid");
    });
  });
});
