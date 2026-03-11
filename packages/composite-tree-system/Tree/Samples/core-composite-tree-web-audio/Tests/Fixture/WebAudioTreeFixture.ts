import { GainNodeModel } from "../../src/Models/GainNodeModel.js";
import { MixerNodeModel } from "../../src/Models/MixerNodeModel.js";
import { OscillatorNodeModel } from "../../src/Models/OscillatorNodeModel.js";

export class WebAudioTreeFixture {
  public readonly root: MixerNodeModel;

  public readonly gainA: GainNodeModel;
  public readonly gainB: GainNodeModel;

  public readonly oscA: OscillatorNodeModel;
  public readonly oscB: OscillatorNodeModel;

  public constructor() {
    this.root = new MixerNodeModel("mixer-main");

    this.gainA = new GainNodeModel("gain-a", 0.25);
    this.gainB = new GainNodeModel("gain-b", 0.25);

    this.oscA = new OscillatorNodeModel("osc-a", 220, "sawtooth");
    this.oscB = new OscillatorNodeModel("osc-b", 330, "square");

    this.gainA.add(this.oscA);
    this.gainB.add(this.oscB);

    this.root.add(this.gainA);
    this.root.add(this.gainB);
  }
}