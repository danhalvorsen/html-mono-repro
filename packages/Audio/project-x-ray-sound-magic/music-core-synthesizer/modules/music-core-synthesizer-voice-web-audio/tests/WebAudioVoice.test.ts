import { should } from "chai";
import { describe, it } from "vitest";

import { DefaultVoiceDefinitionFactory, VoiceDefinitionValidator } from "@monorepo/music-core-synthesizer-voice";

import { WebAudioVoiceFactory } from "../src/index.js";

should();

describe("WebAudioVoiceFactory", () => {
  it("should create one oscillator and one envelope graph per enabled layer", () => {
    const context = new FakeAudioContext();
    const oscillatorFactory = new FakeOscillatorGraphFactory();
    const envelopeFactory = new FakeEnvelopeGraphFactory();

    const factory = new WebAudioVoiceFactory(
      context as never,
      oscillatorFactory as never,
      envelopeFactory as never,
      new VoiceDefinitionValidator(),
    );

    const voice = factory.create({
      definition: DefaultVoiceDefinitionFactory.createTwoLayerDefault(),
      destination: new FakeGainNode() as never,
    });

    voice.gateOn({
      timeSeconds: 1,
      frequencyHz: 261.6255653005986,
      velocity: 0.85,
    });

    oscillatorFactory.graphs.length.should.equal(2);
    envelopeFactory.graphs.length.should.equal(2);
    oscillatorFactory.graphs[0]?.noteOnCount.should.equal(1);
    envelopeFactory.graphs[0]?.gateOnCount.should.equal(1);
  });
});

class FakeAudioContext {
  public readonly currentTime = 0;

  public createGain(): FakeGainNode {
    return new FakeGainNode();
  }
}

class FakeGainNode {
  public readonly gain = {
    setValueAtTime: (_value: number, _time: number): void => {},
  };

  public connect(_destination: unknown): void {}

  public disconnect(): void {}
}

class FakeOscillatorGraphFactory {
  public readonly graphs: FakeOscillatorGraph[] = [];

  public create(_definition: unknown): FakeOscillatorGraph {
    const graph = new FakeOscillatorGraph();
    this.graphs.push(graph);
    return graph;
  }
}

class FakeOscillatorGraph {
  public noteOnCount = 0;

  public connect(_destination: unknown): void {}

  public noteOn(_request: unknown): void {
    this.noteOnCount++;
  }

  public noteOff(_request: unknown): void {}

  public disconnect(): void {}
}

class FakeEnvelopeGraphFactory {
  public readonly graphs: FakeEnvelopeGraph[] = [];

  public create(_definition: unknown): FakeEnvelopeGraph {
    const graph = new FakeEnvelopeGraph();
    this.graphs.push(graph);
    return graph;
  }
}

class FakeEnvelopeGraph {
  public readonly inputNode = new FakeGainNode();
  public gateOnCount = 0;

  public connect(_destination: unknown): void {}

  public gateOn(_request: unknown): void {
    this.gateOnCount++;
  }

  public gateOff(_request: unknown): void {}

  public disconnect(): void {}
}
