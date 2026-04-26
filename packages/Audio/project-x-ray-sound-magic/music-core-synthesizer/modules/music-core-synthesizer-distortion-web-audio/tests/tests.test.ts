import { describe, expect, it } from "vitest";

import {
  DistortionCurveKind,
  DistortionKind,
  type IBitCrushDistortionDefinition,
  type IBypassDistortionDefinition,
  type IHardClipDistortionDefinition,
  type ISoftClipDistortionDefinition,
} from "@monorepo/music-core-synthesizer-distortion-contracts";

import {
  WaveShaperCurveFactory,
  WebAudioDistortionGraphFactory,
  WebAudioDistortionMath,
  type IWebAudioConnectable,
  type IWebAudioContextLike,
  type IWebAudioGainNodeLike,
  type IWebAudioWaveShaperNodeLike,
  type WebAudioOversampleValue,
} from "../src/index.js";

class FakeAudioParam {
  public value = 1;
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

class FakeWaveShaperNode extends FakeAudioNode implements IWebAudioWaveShaperNodeLike {
  public curve: Float32Array | null = null;
  public oversample: WebAudioOversampleValue = "none";
}

class FakeWebAudioContext implements IWebAudioContextLike {
  public readonly sampleRate = 48_000;
  public readonly gainNodes: FakeGainNode[] = [];
  public readonly waveShaperNodes: FakeWaveShaperNode[] = [];

  public createGain(): IWebAudioGainNodeLike {
    const node = new FakeGainNode();
    this.gainNodes.push(node);
    return node;
  }

  public createWaveShaper(): IWebAudioWaveShaperNodeLike {
    const node = new FakeWaveShaperNode();
    this.waveShaperNodes.push(node);
    return node;
  }
}

class DistortionWebAudioFixture {
  public createBypassDefinition(): IBypassDistortionDefinition {
    return {
      kind: DistortionKind.Bypass,
      inputGain: 1,
      outputGain: 1,
      mix: 1,
    };
  }

  public createHardClipDefinition(): IHardClipDistortionDefinition {
    return {
      kind: DistortionKind.HardClip,
      inputGain: 2,
      outputGain: 0.5,
      mix: 0.75,
      threshold: 0.5,
    };
  }

  public createSoftClipDefinition(): ISoftClipDistortionDefinition {
    return {
      kind: DistortionKind.SoftClip,
      inputGain: 1.25,
      outputGain: 0.8,
      mix: 0.5,
      amount: 0.75,
      curve: DistortionCurveKind.Tanh,
    };
  }

  public createUnsupportedBitCrushDefinition(): IBitCrushDistortionDefinition {
    return {
      kind: DistortionKind.BitCrush,
      inputGain: 1,
      outputGain: 1,
      mix: 1,
      bitDepth: 8,
      sampleRateReduction: 4,
    };
  }
}

describe("music-core-synthesizer-distortion-web-audio", () => {
  describe("math", () => {
    it("should clamp bipolar values", () => {
      expect(WebAudioDistortionMath.clampBipolar(-2)).toBe(-1);
      expect(WebAudioDistortionMath.clampBipolar(0.25)).toBe(0.25);
      expect(WebAudioDistortionMath.clampBipolar(2)).toBe(1);
    });

    it("should quantize bipolar values", () => {
      const value = WebAudioDistortionMath.quantizeBipolar(0.2, 4);

      expect(value).toBeGreaterThanOrEqual(-1);
      expect(value).toBeLessThanOrEqual(1);
    });
  });

  describe("curve factory", () => {
    it("should create hard clip wave shaper curves", () => {
      const fixture = new DistortionWebAudioFixture();
      const factory = new WaveShaperCurveFactory({ curveLength: 5 });

      const curve = factory.create(fixture.createHardClipDefinition());

      expect(curve.length).toBe(5);
      expect(curve[0]).toBe(-0.5);
      expect(curve[4]).toBe(0.5);
    });

    it("should create soft clip wave shaper curves", () => {
      const fixture = new DistortionWebAudioFixture();
      const factory = new WaveShaperCurveFactory({ curveLength: 32 });

      const curve = factory.create(fixture.createSoftClipDefinition());

      expect(curve.length).toBe(32);
      expect(curve[0]).toBeGreaterThanOrEqual(-1);
      expect(curve[31]).toBeLessThanOrEqual(1);
    });

    it("should reject bit crusher sample-rate reduction without audio worklet", () => {
      const fixture = new DistortionWebAudioFixture();
      const factory = new WaveShaperCurveFactory({ curveLength: 32 });

      expect(() =>
        factory.create(fixture.createUnsupportedBitCrushDefinition()),
      ).toThrow("AudioWorklet");
    });
  });

  describe("graph factory", () => {
    it("should create a graph and wire expected nodes", () => {
      const fixture = new DistortionWebAudioFixture();
      const context = new FakeWebAudioContext();

      const graph = WebAudioDistortionGraphFactory
        .createDefault(context)
        .create(fixture.createHardClipDefinition());

      expect(graph.definition.kind).toBe(DistortionKind.HardClip);
      expect(context.gainNodes.length).toBe(5);
      expect(context.waveShaperNodes.length).toBe(1);

      const inputNode = context.gainNodes[0];
      const dryGainNode = context.gainNodes[1];
      const wetInputGainNode = context.gainNodes[2];
      const wetOutputGainNode = context.gainNodes[3];
      const outputNode = context.gainNodes[4];
      const shaperNode = context.waveShaperNodes[0];

      expect(inputNode?.connections.length).toBe(2);
      expect(dryGainNode?.connections[0]).toBe(outputNode);
      expect(wetInputGainNode?.connections[0]).toBe(shaperNode);
      expect(shaperNode?.connections[0]).toBe(wetOutputGainNode);
      expect(wetOutputGainNode?.connections[0]).toBe(outputNode);
    });

    it("should apply mix, input gain, and output gain to the graph", () => {
      const fixture = new DistortionWebAudioFixture();
      const context = new FakeWebAudioContext();

      WebAudioDistortionGraphFactory
        .createDefault(context)
        .create(fixture.createHardClipDefinition());

      const dryGainNode = context.gainNodes[1];
      const wetInputGainNode = context.gainNodes[2];
      const wetOutputGainNode = context.gainNodes[3];
      const shaperNode = context.waveShaperNodes[0];

      expect(dryGainNode?.gain.value).toBe(0.25);
      expect(wetInputGainNode?.gain.value).toBe(2);
      expect(wetOutputGainNode?.gain.value).toBe(0.375);
      expect(shaperNode?.oversample).toBe("4x");
      expect(shaperNode?.curve).toBeInstanceOf(Float32Array);
    });

    it("should configure bypass as dry-only", () => {
      const fixture = new DistortionWebAudioFixture();
      const context = new FakeWebAudioContext();

      WebAudioDistortionGraphFactory
        .createDefault(context)
        .create(fixture.createBypassDefinition());

      const dryGainNode = context.gainNodes[1];
      const wetOutputGainNode = context.gainNodes[3];

      expect(dryGainNode?.gain.value).toBe(1);
      expect(wetOutputGainNode?.gain.value).toBe(0);
    });

    it("should update an existing graph", () => {
      const fixture = new DistortionWebAudioFixture();
      const context = new FakeWebAudioContext();

      const graph = WebAudioDistortionGraphFactory
        .createDefault(context)
        .create(fixture.createBypassDefinition());

      graph.update(fixture.createHardClipDefinition());

      expect(graph.definition.kind).toBe(DistortionKind.HardClip);
      expect(context.gainNodes[1]?.gain.value).toBe(0.25);
      expect(context.gainNodes[2]?.gain.value).toBe(2);
      expect(context.gainNodes[3]?.gain.value).toBe(0.375);
    });

    it("should connect and disconnect output node", () => {
      const fixture = new DistortionWebAudioFixture();
      const context = new FakeWebAudioContext();
      const destination = new FakeGainNode();

      const graph = WebAudioDistortionGraphFactory
        .createDefault(context)
        .create(fixture.createBypassDefinition());

      graph.connect(destination);
      graph.disconnect();

      const outputNode = context.gainNodes[4];

      expect(outputNode?.disconnected).toBe(true);
    });

    it("should reject invalid definitions through contract validator", () => {
      const fixture = new DistortionWebAudioFixture();
      const context = new FakeWebAudioContext();

      const invalid = {
        ...fixture.createHardClipDefinition(),
        threshold: 2,
      };

      expect(() =>
        WebAudioDistortionGraphFactory.createDefault(context).create(invalid),
      ).toThrow("Distortion definition is invalid");
    });
  });
});
