import { describe, it, expect } from "vitest";
import { WebAudioSignalGraphBuilder } from "../../../src/index.js";
import { WebAudioTreeFixture } from "../../Fixture/WebAudioTreeFixture.js";

describe("WebAudioSignalGraphBuilder", () => {
  it("should build a correct routing graph", () => {
    const fixture = new WebAudioTreeFixture();
    const sut = new WebAudioSignalGraphBuilder();

    const result = sut.build(fixture.root);

    expect(result.graph.nodes).toHaveLength(5);
    expect(result.graph.edges).toHaveLength(4);
    expect(result.graph.isAcyclic).toBe(true);
  });

  it("should route oscillator -> gain -> mixer", () => {
    const fixture = new WebAudioTreeFixture();
    const sut = new WebAudioSignalGraphBuilder();

    const result = sut.build(fixture.root);

    const edges = result.graph.edges.map(
      (e) => `${e.source.id}->${e.target.id}`
    );

    expect(edges).toEqual([
      "osc-a->gain-a",
      "gain-a->mixer-main",
      "osc-b->gain-b",
      "gain-b->mixer-main"
    ]);
  });
});