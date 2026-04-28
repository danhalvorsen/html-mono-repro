import {
  EnvelopeCurveKind,
  EnvelopeKind,
} from "@monorepo/music-core-synthesizer-envelopes-contracts";

import {
  OscillatorKind,
  OscillatorWaveformKind,
  type OscillatorDefinition,
} from "@monorepo/music-core-synthesizer-oscillators-contracts";

import type {
  IVoice,
  IVoiceDefinition,
} from "@monorepo/music-core-synthesizer-voice-contracts";

import { VoiceFactory } from "@monorepo/music-core-synthesizer-voice";

const createVoiceButton = getElement<HTMLButtonElement>("create-voice");
const gateOnButton = getElement<HTMLButtonElement>("gate-on");
const gateOffButton = getElement<HTMLButtonElement>("gate-off");
const resetButton = getElement<HTMLButtonElement>("reset");

const stateOutput = getElement<HTMLOutputElement>("voice-state");
const frequencyOutput = getElement<HTMLOutputElement>("voice-frequency");
const velocityOutput = getElement<HTMLOutputElement>("voice-velocity");

let voice: IVoice | null = null;

createVoiceButton.addEventListener("click", () => {
  voice = VoiceFactory.createDefault().create(createVoiceDefinition());
  renderVoice();
});

gateOnButton.addEventListener("click", () => {
  if (voice === null) {
    return;
  }

  voice.gateOn({
    timeSeconds: 0,
    frequencyHz: 440,
    velocity: 0.75,
  });

  renderVoice();
});

gateOffButton.addEventListener("click", () => {
  if (voice === null) {
    return;
  }

  voice.gateOff({
    timeSeconds: 0.5,
  });

  renderVoice();
});

resetButton.addEventListener("click", () => {
  if (voice === null) {
    return;
  }

  voice.reset();
  renderVoice();
});

function renderVoice(): void {
  if (voice === null) {
    stateOutput.value = "not-created";
    frequencyOutput.value = "none";
    velocityOutput.value = "0";
    return;
  }

  const snapshot = voice.snapshot();

  stateOutput.value = snapshot.state;
  frequencyOutput.value =
    snapshot.frequencyHz === null ? "none" : String(snapshot.frequencyHz);
  velocityOutput.value = String(snapshot.velocity);
}

function createVoiceDefinition(): IVoiceDefinition {
  return {
    id: "browser-test-voice",
    outputGain: 0.8,
    layers: [
      {
        id: "main-layer",
        enabled: true,
        gain: 1,
        oscillators: [
          createBasicOscillator(440, 0),
          createBasicOscillator(440, -7),
          createBasicOscillator(440, 7),
        ],
        envelope: {
          kind: EnvelopeKind.Adsr,
          attackSeconds: 0.01,
          decaySeconds: 0.12,
          sustainLevel: 0.7,
          releaseSeconds: 0.25,
          attackCurve: { kind: EnvelopeCurveKind.Linear },
          decayCurve: { kind: EnvelopeCurveKind.Exponential },
          releaseCurve: { kind: EnvelopeCurveKind.Exponential },
        },
      },
    ],
  };
}

function createBasicOscillator(
  frequencyHz: number,
  detuneCents: number,
): OscillatorDefinition {
  return {
    kind: OscillatorKind.Basic,
    waveform: OscillatorWaveformKind.Sawtooth,
    frequencyHz,
    detuneCents,
    phaseRadians: 0,
    gain: 1,
  };
}

function getElement<TElement extends HTMLElement>(id: string): TElement {
  const element = document.getElementById(id);

  if (element === null) {
    throw new Error(`Expected element '${id}' to exist.`);
  }

  return element as TElement;
}