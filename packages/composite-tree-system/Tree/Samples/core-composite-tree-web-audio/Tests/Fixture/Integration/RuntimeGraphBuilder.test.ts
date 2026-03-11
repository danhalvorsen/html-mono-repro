
import { describe, expect, it } from "vitest";
import { WebAudioRuntimeFixture } from '../WebAudioRuntimeFixture.js';
import { GainRuntimeNode, MixerRuntimeNode, OscillatorRuntimeNode } from "../../../src/index.js";

describe("RuntimeGraphBuilder", () => {
  it("should build runtime graph with expected runtime node counts", () => {
    const fixture = new WebAudioRuntimeFixture();

    const result = fixture.runtimeGraphBuilder.build(
      fixture.tree.root,
      fixture.context as unknown as AudioContext
    );

    expect(result.runtimeNodes).toHaveLength(5);
    expect(result.startableNodes).toHaveLength(2);
    expect(result.output).toBeDefined();
  });

  it("should create the expected runtime node types", () => {
    const fixture = new WebAudioRuntimeFixture();

    const result = fixture.runtimeGraphBuilder.build(
      fixture.tree.root,
      fixture.context as unknown as AudioContext
    );

    expect(result.runtimeNodes.filter(x => x instanceof OscillatorRuntimeNode)).toHaveLength(2);
    expect(result.runtimeNodes.filter(x => x instanceof GainRuntimeNode)).toHaveLength(2);
    expect(result.runtimeNodes.filter(x => x instanceof MixerRuntimeNode)).toHaveLength(1);
  });

  it("should mark only oscillator runtime nodes as startable", () => {
    const fixture = new WebAudioRuntimeFixture();

    const result = fixture.runtimeGraphBuilder.build(
      fixture.tree.root,
      fixture.context as unknown as AudioContext
    );

    expect(result.startableNodes.every(x => x instanceof OscillatorRuntimeNode)).toBe(true);
  });

  it("should configure oscillator nodes from model values", () => {
    const fixture = new WebAudioRuntimeFixture();

    fixture.runtimeGraphBuilder.build(
      fixture.tree.root,
      fixture.context as unknown as AudioContext
    );

    expect(fixture.context.createdOscillatorNodes).toHaveLength(2);
    expect(fixture.context.createdOscillatorNodes[0].frequency.value).toBe(220);
    expect(fixture.context.createdOscillatorNodes[0].type).toBe("sawtooth");
    expect(fixture.context.createdOscillatorNodes[1].frequency.value).toBe(330);
    expect(fixture.context.createdOscillatorNodes[1].type).toBe("square");
  });

  it("should configure gain nodes from model values", () => {
    const fixture = new WebAudioRuntimeFixture();

    fixture.runtimeGraphBuilder.build(
      fixture.tree.root,
      fixture.context as unknown as AudioContext
    );

    expect(fixture.context.createdGainNodes).toHaveLength(3);
    expect(fixture.context.createdGainNodes[0].gain.value).toBe(1);
    expect(fixture.context.createdGainNodes[1].gain.value).toBe(0.25);
    expect(fixture.context.createdGainNodes[2].gain.value).toBe(0.25);
  });

  it("should connect runtime nodes according to signal graph", () => {
    const fixture = new WebAudioRuntimeFixture();

    fixture.runtimeGraphBuilder.build(
      fixture.tree.root,
      fixture.context as unknown as AudioContext
    );

    const mixerNode = fixture.context.createdGainNodes[0];
    const gainNodeA = fixture.context.createdGainNodes[1];
    const gainNodeB = fixture.context.createdGainNodes[2];
    const oscNodeA = fixture.context.createdOscillatorNodes[0];
    const oscNodeB = fixture.context.createdOscillatorNodes[1];

    expect(oscNodeA.connections).toContain(gainNodeA);
    expect(oscNodeB.connections).toContain(gainNodeB);
    expect(gainNodeA.connections).toContain(mixerNode);
    expect(gainNodeB.connections).toContain(mixerNode);
  });

  it("should expose the root runtime output as mixer output", () => {
    const fixture = new WebAudioRuntimeFixture();

    const result = fixture.runtimeGraphBuilder.build(
      fixture.tree.root,
      fixture.context as unknown as AudioContext
    );

    expect(result.output).toBe(fixture.context.createdGainNodes[0] as unknown as AudioNode);
  });
});

