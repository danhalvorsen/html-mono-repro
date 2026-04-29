import {
  MidiMessageKinds,
  type IMidiStreamSink,
  type MidiStreamCompleted,
  type MidiStreamFailure,
  type MidiStreamMessage,
} from "@monorepo/audio-function-midi-streamer-contracts";
import {
  EqualTemperamentFrequencyMapper,
  type IFrequencyMapper,
} from "../domain/EqualTemperamentFrequencyMapper.js";

export interface WebAudioMidiStreamSinkOptions {
  readonly context: AudioContext;
  readonly output: AudioNode;
  readonly oscillatorType: OscillatorType;
  readonly maxGain: number;
  readonly releaseSeconds: number;
  readonly frequencyMapper: IFrequencyMapper;
}

interface ActiveVoice {
  readonly oscillator: OscillatorNode;
  readonly gain: GainNode;
}

export class WebAudioMidiStreamSink implements IMidiStreamSink {
  private readonly voices = new Map<string, ActiveVoice>();

  public constructor(private readonly options: WebAudioMidiStreamSinkOptions) {
    if (options.maxGain < 0 || options.maxGain > 1) {
      throw new RangeError("maxGain must be in range 0..1.");
    }

    if (options.releaseSeconds < 0) {
      throw new RangeError("releaseSeconds must be non-negative.");
    }
  }

  public static createDefault(context: AudioContext): WebAudioMidiStreamSink {
    return new WebAudioMidiStreamSink({
      context,
      output: context.destination,
      oscillatorType: "sine",
      maxGain: 0.2,
      releaseSeconds: 0.03,
      frequencyMapper: new EqualTemperamentFrequencyMapper(),
    });
  }

  public send(event: MidiStreamMessage): void {
    switch (event.message.kind) {
      case MidiMessageKinds.noteOn:
        if (event.message.velocity === 0) {
          this.stopVoice(event.message.channel, event.message.note);
          return;
        }

        this.startVoice(
          event.message.channel,
          event.message.note,
          event.message.velocity,
        );
        return;

      case MidiMessageKinds.noteOff:
        this.stopVoice(event.message.channel, event.message.note);
        return;

      case MidiMessageKinds.controlChange:
      case MidiMessageKinds.pitchBend:
      case MidiMessageKinds.systemExclusive:
        return;
    }
  }

  public complete(_event: MidiStreamCompleted): void {
    this.stopAllVoices();
  }

  public fail(_error: MidiStreamFailure): void {
    this.stopAllVoices();
  }

  private startVoice(channel: number, note: number, velocity: number): void {
    this.stopVoice(channel, note);

    const oscillator = this.options.context.createOscillator();
    const gain = this.options.context.createGain();
    const frequency = this.options.frequencyMapper.mapMidiNoteToFrequency(note);
    const now = this.options.context.currentTime;

    oscillator.type = this.options.oscillatorType;
    oscillator.frequency.setValueAtTime(frequency, now);

    gain.gain.setValueAtTime(
      (velocity / 127) * this.options.maxGain,
      now,
    );

    oscillator.connect(gain);
    gain.connect(this.options.output);
    oscillator.start(now);

    this.voices.set(this.createVoiceKey(channel, note), {
      oscillator,
      gain,
    });
  }

  private stopVoice(channel: number, note: number): void {
    const key = this.createVoiceKey(channel, note);
    const voice = this.voices.get(key);

    if (voice === undefined) {
      return;
    }

    this.voices.delete(key);

    const now = this.options.context.currentTime;
    const stopAt = now + this.options.releaseSeconds;

    voice.gain.gain.cancelScheduledValues(now);
    voice.gain.gain.setValueAtTime(voice.gain.gain.value, now);
    voice.gain.gain.linearRampToValueAtTime(0, stopAt);

    voice.oscillator.stop(stopAt);
    voice.oscillator.onended = (): void => {
      voice.oscillator.disconnect();
      voice.gain.disconnect();
    };
  }

  private stopAllVoices(): void {
    const voiceKeys = [...this.voices.keys()];

    for (const key of voiceKeys) {
      const [channelText, noteText] = key.split(":");
      const channel = Number(channelText);
      const note = Number(noteText);

      if (Number.isInteger(channel) && Number.isInteger(note)) {
        this.stopVoice(channel, note);
      }
    }
  }

  private createVoiceKey(channel: number, note: number): string {
    return `${channel}:${note}`;
  }
}