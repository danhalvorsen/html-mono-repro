import type { MidiPlaybackOptions } from "../contracts/MidiPlaybackOptions.js";
import type { IMidiNoteFrequencyConverter } from "../math/IMidiNoteFrequencyConverter.js";
import type { IMidiVoiceKeyFactory } from "../midi/MidiVoiceKeyFactory.js";
import type { NoteOnMidiMessage } from "../midi/NoteMidiMessage.js";
import type {
  IAmpEnvelopeScheduler,
} from "./AmpEnvelopeScheduler.js";
import type {
  IFilterEnvelopeScheduler,
} from "./FilterEnvelopeScheduler.js";
import type { IVoice } from "./IVoice.js";
import { WebAudioSynthConfiguration } from "./WebAudioSynthConfiguration.js";
import { WebAudioVoice } from "./WebAudioVoice.js";

export type CreateWebAudioVoiceArgs = {
  readonly message: NoteOnMidiMessage;
  readonly options?: MidiPlaybackOptions;
  readonly startAtSeconds: number;
};

export interface IWebAudioVoiceFactory {
  create(args: CreateWebAudioVoiceArgs): IVoice;
}

export type WebAudioVoiceFactoryArgs = {
  readonly context: AudioContext;
  readonly configuration: WebAudioSynthConfiguration;
  readonly voiceKeyFactory: IMidiVoiceKeyFactory;
  readonly frequencyConverter: IMidiNoteFrequencyConverter;
  readonly ampEnvelopeScheduler: IAmpEnvelopeScheduler;
  readonly filterEnvelopeScheduler: IFilterEnvelopeScheduler;
};

export class WebAudioVoiceFactory implements IWebAudioVoiceFactory {
  private readonly context: AudioContext;
  private readonly configuration: WebAudioSynthConfiguration;
  private readonly voiceKeyFactory: IMidiVoiceKeyFactory;
  private readonly frequencyConverter: IMidiNoteFrequencyConverter;
  private readonly ampEnvelopeScheduler: IAmpEnvelopeScheduler;
  private readonly filterEnvelopeScheduler: IFilterEnvelopeScheduler;

  public constructor(args: WebAudioVoiceFactoryArgs) {
    this.context = args.context;
    this.configuration = args.configuration;
    this.voiceKeyFactory = args.voiceKeyFactory;
    this.frequencyConverter = args.frequencyConverter;
    this.ampEnvelopeScheduler = args.ampEnvelopeScheduler;
    this.filterEnvelopeScheduler = args.filterEnvelopeScheduler;
  }

  public create(args: CreateWebAudioVoiceArgs): IVoice {
    const note = args.message.note.value();
    const velocity = args.message.velocity.value();
    const frequency = this.frequencyConverter.toFrequency(note);

    const oscA = this.context.createOscillator();
    const oscB = this.context.createOscillator();
    const oscSub = this.context.createOscillator();

    const oscAGain = this.context.createGain();
    const oscBGain = this.context.createGain();
    const oscSubGain = this.context.createGain();

    const panA = this.context.createStereoPanner();
    const panB = this.context.createStereoPanner();

    const mix = this.context.createGain();
    const amp = this.context.createGain();
    const filter = this.context.createBiquadFilter();

    oscA.type = "sawtooth";
    oscB.type = "sawtooth";
    oscSub.type = "square";

    oscA.frequency.value = frequency;
    oscB.frequency.value = frequency;
    oscSub.frequency.value = frequency / 2;

    oscA.detune.value = -this.configuration.detuneCents;
    oscB.detune.value = this.configuration.detuneCents;
    oscSub.detune.value = -2;

    oscAGain.gain.value = 0.58;
    oscBGain.gain.value = this.configuration.oscBLevel;
    oscSubGain.gain.value = this.configuration.subLevel;

    panA.pan.value = -this.configuration.panSpread;
    panB.pan.value = this.configuration.panSpread;

    const effectiveFilterFrequency =
      args.options?.filterFrequency ?? this.configuration.filter.frequency;

    filter.type = this.configuration.filter.type;
    filter.frequency.value = effectiveFilterFrequency * 0.62;
    filter.Q.value = args.options?.filterQ ?? this.configuration.filter.q;

    const ampSchedule = this.ampEnvelopeScheduler.scheduleAttackDecaySustain(
      amp.gain,
      args.options?.sustain === undefined
        ? {
            envelope: this.configuration.envelope,
            velocity,
            startAtSeconds: args.startAtSeconds,
          }
        : {
            envelope: this.configuration.envelope,
            velocity,
            sustainOverride: args.options.sustain,
            startAtSeconds: args.startAtSeconds,
          },
    );

    const filterSchedule =
      this.filterEnvelopeScheduler.scheduleAttackDecaySustain(
        filter.frequency,
        {
          envelope: this.configuration.filterEnvelope,
          filterBaseFrequency: effectiveFilterFrequency,
          velocity,
          filterEnvAmount: this.configuration.filterEnvAmount,
          velocityToFilter: this.configuration.velocityToFilter,
          startAtSeconds: args.startAtSeconds,
        },
      );

    oscA.connect(oscAGain);
    oscB.connect(oscBGain);
    oscSub.connect(oscSubGain);

    oscAGain.connect(panA);
    oscBGain.connect(panB);

    panA.connect(mix);
    panB.connect(mix);
    oscSubGain.connect(mix);

    mix.connect(filter);
    filter.connect(amp);
    amp.connect(this.context.destination);

    oscA.start(args.startAtSeconds);
    oscB.start(args.startAtSeconds);
    oscSub.start(args.startAtSeconds);

    return new WebAudioVoice({
      key: this.voiceKeyFactory.create(args.message),
      oscillators: [oscA, oscB, oscSub],
      nodesToDisconnect: [
        oscA,
        oscB,
        oscSub,
        oscAGain,
        oscBGain,
        oscSubGain,
        panA,
        panB,
        mix,
        filter,
        amp,
      ],
      amp,
      filter,
      ampEnvelopeScheduler: this.ampEnvelopeScheduler,
      filterEnvelopeScheduler: this.filterEnvelopeScheduler,
      releaseSeconds: ampSchedule.releaseSeconds,
      filterBaseFrequency: filterSchedule.filterBaseFrequency,
      filterSustainFrequency: filterSchedule.filterSustainFrequency,
      filterReleaseSeconds: filterSchedule.releaseSeconds,
    });
  }
}

