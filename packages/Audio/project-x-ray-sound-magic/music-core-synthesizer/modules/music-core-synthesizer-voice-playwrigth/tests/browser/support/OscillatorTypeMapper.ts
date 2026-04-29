import {
  OscillatorWaveformKind,
  type IBasicOscillatorDefinition,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";

export class OscillatorTypeMapper {
  public static map(
    waveform: IBasicOscillatorDefinition["waveform"],
  ): OscillatorType {
    switch (waveform) {
      case OscillatorWaveformKind.Sine:
        return "sine";

      case OscillatorWaveformKind.Square:
        return "square";

      case OscillatorWaveformKind.Sawtooth:
        return "sawtooth";

      case OscillatorWaveformKind.Triangle:
        return "triangle";
    }
  }
}
