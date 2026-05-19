export class EnvelopeADSR {
  private constructor(
    public readonly attack: number,
    public readonly decay: number,
    public readonly sustain: number,
    public readonly release: number,
  ) {}

  public static create(
    attack: number,
    decay: number,
    sustain: number,
    release: number,
  ): EnvelopeADSR {
    if (attack < 0 || decay < 0 || sustain < 0 || sustain > 1 || release < 0) {
      throw new Error("Invalid ADSR");
    }

    return new EnvelopeADSR(attack, decay, sustain, release);
  }
}
