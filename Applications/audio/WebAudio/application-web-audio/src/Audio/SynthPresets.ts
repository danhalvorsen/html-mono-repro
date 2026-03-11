// Applications/audio/WebAudio/application-web-audio/src/Audio/SynthPresets.ts

import type { SynthesizerModel } from "../lit3/WebComponents/Synthesizer/SynthesizerModel.js";

export const SynthPresets = {

  default: {
    oscillators: [
      {
        id: "osc-1",
        type: "sawtooth",
        frequency: 440,
        detune: -6,
        gain: 0.18,
      },
      {
        id: "osc-2",
        type: "sawtooth",
        frequency: 440,
        detune: 6,
        gain: 0.18,
      }
    ],
    mixerLevel: 1,
  },

  lead: {
    oscillators: [
      {
        id: "lead-1",
        type: "sawtooth",
        frequency: 660,
        detune: -8,
        gain: 0.15,
      },
      {
        id: "lead-2",
        type: "sawtooth",
        frequency: 660,
        detune: 8,
        gain: 0.15,
      }
    ],
    mixerLevel: 1,
  },

  bass: {
    oscillators: [
      {
        id: "bass-1",
        type: "square",
        frequency: 110,
        detune: -4,
        gain: 0.2,
      },
      {
        id: "bass-2",
        type: "sine",
        frequency: 55,
        detune: 0,
        gain: 0.1,
      }
    ],
    mixerLevel: 1,
  }

} satisfies Record<string, SynthesizerModel>;