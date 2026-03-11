import { GainNodeModel } from "./Models/GainNodeModel.js";
import { MixerNodeModel } from "./Models/MixerNodeModel.js";
import { OscillatorNodeModel } from "./Models/OscillatorNodeModel.js";

export function createSampleTree(): MixerNodeModel {
  const root = new MixerNodeModel("mixer-main");

  const gainA = new GainNodeModel("gain-a", 0.25, [
    new OscillatorNodeModel("osc-a", 220, "sawtooth"),
  ]);

  const gainB = new GainNodeModel("gain-b", 0.25, [
    new OscillatorNodeModel("osc-b", 330, "square"),
  ]);

  root.add(gainA);
  root.add(gainB);

  return root;
}