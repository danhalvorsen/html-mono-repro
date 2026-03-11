
import { describe, expect, it } from "vitest";
 import { GainNodeModel, GainRuntimeNode, MixerRuntimeNode, OscillatorRuntimeNode, WebAudioSignalGraphBuilder } from "../../../src/index.js";
import { WebAudioTreeFixture } from "../WebAudioTreeFixture.js";

describe("WebAudioSignalGraphBuilder", () => {
  it("should build graph with expected nodes and edges", () => {
    const fixture = new WebAudioTreeFixture();
    const sut = new WebAudioSignalGraphBuilder();

    const result = sut.build(fixture.root);

    expect(result.graph.nodes).toHaveLength(5);
    expect(result.graph.edges).toHaveLength(4);
    expect(result.routes).toHaveLength(4);
    expect(result.nodeMap.size).toBe(5);
    expect(result.reverseNodeMap.size).toBe(5);
    expect(result.graph.isAcyclic).toBe(true);
  });

  it("should build expected routes in deterministic order", () => {
    const fixture = new WebAudioTreeFixture();
    const sut = new WebAudioSignalGraphBuilder();

    const result = sut.build(fixture.root);

    const actual = result.routes.map(route => `${route.item1.id}->${route.item2.id}`);

    expect(actual).toEqual([
      "osc-a->gain-a",
      "gain-a->mixer-main",
      "osc-b->gain-b",
      "gain-b->mixer-main",
    ]);
  });

  it("should map every model node to a graph node", () => {
    const fixture = new WebAudioTreeFixture();
    const sut = new WebAudioSignalGraphBuilder();

    const result = sut.build(fixture.root);

    expect(result.nodeMap.get(fixture.root)?.id).toBe("mixer-main");
    expect(result.nodeMap.get(fixture.gainA)?.id).toBe("gain-a");
    expect(result.nodeMap.get(fixture.gainB)?.id).toBe("gain-b");
    expect(result.nodeMap.get(fixture.oscA)?.id).toBe("osc-a");
    expect(result.nodeMap.get(fixture.oscB)?.id).toBe("osc-b");
  });

  it("should map every graph node back to the original model node", () => {
    const fixture = new WebAudioTreeFixture();
    const sut = new WebAudioSignalGraphBuilder();

    const result = sut.build(fixture.root);

    for (const [modelNode, graphNode] of result.nodeMap.entries()) {
      expect(result.reverseNodeMap.get(graphNode)).toBe(modelNode);
    }
  });

  it("should throw when gain node has no child", () => {
    const gain = new GainNodeModel("gain-a", 0.25);
    const sut = new WebAudioSignalGraphBuilder();

    expect(() => sut.build(gain)).toThrowError(
      "Gain 'gain-a' must contain exactly one child."
    );
  });
});
 