import { MidiStatus, type MidiMessage } from "@monorepo/music-core-midi";
import type { ISequencerSoundEngine } from "../contracts/ISequencerSoundEngine.js";
import type { MidiPlaybackOptions } from "../contracts/MidiPlaybackOptions.js";
import { EqualTemperamentMidiNoteFrequencyConverter } from "../math/EqualTemperamentMidiNoteFrequencyConverter.js";
import type { IMidiNoteFrequencyConverter } from "../math/IMidiNoteFrequencyConverter.js";
import {
  MidiVoiceKeyFactory,
  type IMidiVoiceKeyFactory,
} from "../midi/MidiVoiceKeyFactory.js";
import type {
  NoteOffMidiMessage,
  NoteOnMidiMessage,
} from "../midi/NoteMidiMessage.js";
import {
  AmpEnvelopeScheduler,
  type IAmpEnvelopeScheduler,
} from "./AmpEnvelopeScheduler.js";
import {
  FilterEnvelopeScheduler,
  type IFilterEnvelopeScheduler,
} from "./FilterEnvelopeScheduler.js";
import type { IVoiceRegistry } from "./IVoiceRegistry.js";
import {
  WebAudioSynthConfiguration,
  type WebAudioSynthConfigurationArgs,
} from "./WebAudioSynthConfiguration.js";
import {
  WebAudioVoiceFactory,
  type IWebAudioVoiceFactory,
} from "./WebAudioVoiceFactory.js";
import { WebAudioVoiceRegistry } from "./WebAudioVoiceRegistry.js";

export type WebAudioMidiPlayerArgs = WebAudioSynthConfigurationArgs & {
  readonly context?: AudioContext;
  readonly voiceRegistry?: IVoiceRegistry;
  readonly voiceFactory?: IWebAudioVoiceFactory;
  readonly voiceKeyFactory?: IMidiVoiceKeyFactory;
  readonly frequencyConverter?: IMidiNoteFrequencyConverter;
  readonly ampEnvelopeScheduler?: IAmpEnvelopeScheduler;
  readonly filterEnvelopeScheduler?: IFilterEnvelopeScheduler;
};

export class WebAudioMidiPlayer implements ISequencerSoundEngine {
  private readonly context: AudioContext;
  private readonly configuration: WebAudioSynthConfiguration;
  private readonly voiceRegistry: IVoiceRegistry;
  private readonly voiceFactory: IWebAudioVoiceFactory;
  private readonly voiceKeyFactory: IMidiVoiceKeyFactory;

  public constructor(args: WebAudioMidiPlayerArgs) {
    this.context = args.context ?? new AudioContext();
    this.configuration = WebAudioSynthConfiguration.create(args);

    this.voiceRegistry = args.voiceRegistry ?? new WebAudioVoiceRegistry();
    this.voiceKeyFactory = args.voiceKeyFactory ?? new MidiVoiceKeyFactory();

    const frequencyConverter =
      args.frequencyConverter ?? new EqualTemperamentMidiNoteFrequencyConverter();

    const ampEnvelopeScheduler =
      args.ampEnvelopeScheduler ?? new AmpEnvelopeScheduler();

    const filterEnvelopeScheduler =
      args.filterEnvelopeScheduler ?? new FilterEnvelopeScheduler();

    this.voiceFactory =
      args.voiceFactory ??
      new WebAudioVoiceFactory({
        context: this.context,
        configuration: this.configuration,
        voiceKeyFactory: this.voiceKeyFactory,
        frequencyConverter,
        ampEnvelopeScheduler,
        filterEnvelopeScheduler,
      });
  }

  public play(message: MidiMessage, options?: MidiPlaybackOptions): void {
    if (message.status === MidiStatus.NoteOff) {
      this.releaseVoice(message as NoteOffMidiMessage, options?.startAtSeconds);
      return;
    }

    if (message.status !== MidiStatus.NoteOn) {
      return;
    }

    const noteOn = message as NoteOnMidiMessage;

    if (noteOn.velocity.value() === 0) {
      return;
    }

    if (this.context.state === "suspended") {
      void this.context
        .resume()
        .then(() => this.play(message, options))
        .catch(() => undefined);

      return;
    }

    const now = Math.max(
      this.context.currentTime,
      options?.startAtSeconds ?? this.context.currentTime,
    );

    const voice = this.voiceFactory.create(
      options === undefined
        ? {
            message: noteOn,
            startAtSeconds: now,
          }
        : {
            message: noteOn,
            options,
            startAtSeconds: now,
          },
    );

    this.voiceRegistry.add(voice);

    const sustainUntilNoteOff = options?.sustainUntilNoteOff ?? false;
    const noteLengthSeconds =
      options?.noteLengthSeconds ?? this.configuration.noteLengthSeconds;

    if (!sustainUntilNoteOff && noteLengthSeconds > 0) {
      voice.release(now + noteLengthSeconds);
    }
  }

  public getCurrentTimeSeconds(): number {
    return this.context.currentTime;
  }

  public allNotesOff(channel?: number): void {
    const now = this.context.currentTime;

    for (const voice of this.voiceRegistry.getAll(channel)) {
      if (!voice.isReleased) {
        voice.release(now);
      }
    }

    this.voiceRegistry.clear(channel);
  }

  public allSoundOff(channel?: number): void {
    this.allNotesOff(channel);
  }

  public panic(): void {
    const now = this.context.currentTime;

    for (const voice of this.voiceRegistry.getAll()) {
      voice.stopImmediately(now);
    }

    this.voiceRegistry.clear();
  }

  private releaseVoice(
    message: NoteOffMidiMessage,
    releaseAtSeconds?: number,
  ): void {
    const key = this.voiceKeyFactory.create(message);
    const voice = this.voiceRegistry.takeNext(key);

    if (voice === undefined) {
      return;
    }

    voice.release(
      Math.max(this.context.currentTime, releaseAtSeconds ?? this.context.currentTime),
    );
  }
}

