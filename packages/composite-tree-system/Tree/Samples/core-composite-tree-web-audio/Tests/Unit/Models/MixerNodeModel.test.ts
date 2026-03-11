
import { describe, expect, it } from "vitest";
import { GainNodeModel } from "../../../src/Models/GainNodeModel.js";
import { MixerNodeModel } from "../../../src/Models/MixerNodeModel.js";

describe("MixerNodeModel", () => {
  it("should allow multiple gain children", () => {
    const sut = new MixerNodeModel("mixer-main");
    const gainA = new GainNodeModel("gain-a", 0.25);
    const gainB = new GainNodeModel("gain-b", 0.5);

    sut.add(gainA);
    sut.add(gainB);

    expect(sut.children).toHaveLength(2);
    expect(sut.children[0]).toBe(gainA);
    expect(sut.children[1]).toBe(gainB);
    expect(gainA.parent).toBe(sut);
    expect(gainB.parent).toBe(sut);
  });

  it("should accept initial children in constructor", () => {
    const gainA = new GainNodeModel("gain-a", 0.25);
    const gainB = new GainNodeModel("gain-b", 0.5);

    const sut = new MixerNodeModel("mixer-main", [gainA, gainB]);

    expect(sut.children).toHaveLength(2);
    expect(gainA.parent).toBe(sut);
    expect(gainB.parent).toBe(sut);
  });
}); 