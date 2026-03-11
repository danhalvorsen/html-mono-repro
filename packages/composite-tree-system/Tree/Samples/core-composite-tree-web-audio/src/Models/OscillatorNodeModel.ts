import { AudioSourceNodeBase } from "../Nodes/AudioSourceNodeBase.js";

export class OscillatorNodeModel extends AudioSourceNodeBase {
  public constructor(
    id: string,
    public readonly frequencyHz: number,
    public readonly waveform: OscillatorType = "sine",
    public readonly detuneCents: number = 0
  ) {
    super(id);

    if (!Number.isFinite(frequencyHz) || frequencyHz <= 0) {
      throw new Error("Oscillator must have frequency > 0.");
    }

    if (!Number.isFinite(detuneCents)) {
      throw new Error("Oscillator must have finite detune.");
    }
  }
}
