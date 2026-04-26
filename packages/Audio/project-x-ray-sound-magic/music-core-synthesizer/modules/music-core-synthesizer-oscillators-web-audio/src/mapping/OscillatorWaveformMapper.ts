import {
  OscillatorWaveformKind,
  type OscillatorWaveformKind as OscillatorWaveformKindValue,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";

import type { WebAudioOscillatorTypeValue } from "../ports/index.js";

export class OscillatorWaveformMapper {
  public map(waveform: OscillatorWaveformKindValue): WebAudioOscillatorTypeValue {
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
