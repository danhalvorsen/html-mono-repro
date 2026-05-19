import {
  createNoteOn,
  MidiChannel,
  MidiNote,
  MidiVelocity,
} from "@monorepo/music-core-midi";
import {
  DrumVoicePreset,
  EnvelopeADSR,
  FilterSettings,
  FilterType,
  WebAudioMidiPlayer,
} from "@monorepo/music-core-midi-playback";
import type {
  IVoiceSource,
  VoiceFilterConfig,
  VoiceTrigger,
} from "./IVoiceSource.js";

export class SynthVoiceSource implements IVoiceSource {
  private filter: VoiceFilterConfig = {
    enabled: true,
    type: "lowpass",
    frequency: 1200,
    q: 1,
  };
  private player = this.createPlayer();

  public trigger(voice: VoiceTrigger): void {
    this.player.play(
      createNoteOn(
        MidiChannel.create(1),
        MidiNote.create(voice.note),
        MidiVelocity.create(voice.velocity),
      ),
      {
        noteLengthSeconds: Math.max(0.03, voice.holdMs / 1000),
        filterFrequency: this.filter.enabled ? this.filter.frequency : 20000,
        filterQ: this.filter.enabled ? this.filter.q : 0.0001,
      },
    );
  }

  public setFilter(config: VoiceFilterConfig): void {
    this.filter = config;
    this.player = this.createPlayer();
  }

  private createPlayer(): WebAudioMidiPlayer {
    const filterType =
      this.filter.enabled
        ? this.toFilterType(this.filter.type)
        : FilterType.LowPass;
    const filterFrequency =
      this.filter.enabled
        ? this.filter.frequency
        : 20000;
    const filterQ =
      this.filter.enabled
        ? this.filter.q
        : 0.0001;

    return new WebAudioMidiPlayer({
      ...DrumVoicePreset,
      envelope: EnvelopeADSR.create(
        DrumVoicePreset.envelope.attack,
        DrumVoicePreset.envelope.decay,
        DrumVoicePreset.envelope.sustain,
        DrumVoicePreset.envelope.release,
      ),
      filter: FilterSettings.create(filterType, filterFrequency, filterQ),
      filterEnvelope: EnvelopeADSR.create(
        DrumVoicePreset.filterEnvelope.attack,
        DrumVoicePreset.filterEnvelope.decay,
        DrumVoicePreset.filterEnvelope.sustain,
        DrumVoicePreset.filterEnvelope.release,
      ),
    });
  }

  private toFilterType(type: VoiceFilterConfig["type"]): FilterType {
    switch (type) {
      case "bandpass":
        return FilterType.BandPass;
      case "highpass":
        return FilterType.HighPass;
      case "lowpass":
      default:
        return FilterType.LowPass;
    }
  }
}
