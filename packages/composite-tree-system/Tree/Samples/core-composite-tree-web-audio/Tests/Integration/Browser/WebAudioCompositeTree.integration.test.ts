import {
  describe,
  expect,
  it,
} from "vitest";

import {
  GainNodeModel,
  MixerNodeModel,
  OscillatorNodeModel,
} from "../../../src/index.js";

describe("core-composite-tree-web-audio integration", () => {
  it("should compose mixer -> gain -> oscillator hierarchy", () => {
    const mixer = new MixerNodeModel("mixer-main");
    const gain = new GainNodeModel("gain-main", 0.25);
    const oscillator = new OscillatorNodeModel("osc-main", 220, "sawtooth");

    gain.add(oscillator);
    mixer.add(gain);

    expect(mixer.children).toHaveLength(1);
    expect(mixer.children[0]).toBe(gain);
    expect(gain.parent).toBe(mixer);

    expect(gain.children).toHaveLength(1);
    expect(gain.children[0]).toBe(oscillator);
    expect(oscillator.parent).toBe(gain);
    expect(oscillator.children).toHaveLength(0);
  });

  it("should reject more than one child on gain", () => {
    const gain = new GainNodeModel("gain-main", 0.25);

    gain.add(new OscillatorNodeModel("osc-a", 220, "sawtooth"));

    expect(() =>
      gain.add(new OscillatorNodeModel("osc-b", 330, "square"))
    ).toThrowError("Gain node accepts exactly one child.");
  });

  it("should reject mixer directly under gain", () => {
    const gain = new GainNodeModel("gain-main", 0.25);
    const mixer = new MixerNodeModel("mixer-child");

    expect(() => gain.add(mixer)).toThrowError(
      "Gain node cannot directly contain a mixer node."
    );
  });

  it("should preserve parent references across the full tree", () => {
    const root = new MixerNodeModel("root");
    const gainA = new GainNodeModel("gain-a", 0.2);
    const gainB = new GainNodeModel("gain-b", 0.3);
    const oscA = new OscillatorNodeModel("osc-a", 110);
    const oscB = new OscillatorNodeModel("osc-b", 220);

    gainA.add(oscA);
    gainB.add(oscB);
    root.add(gainA);
    root.add(gainB);

    expect(oscA.parent).toBe(gainA);
    expect(oscB.parent).toBe(gainB);
    expect(gainA.parent).toBe(root);
    expect(gainB.parent).toBe(root);
  });
});