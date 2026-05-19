import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import {
  type AdsrControlsValue,
} from "./components/sub-controls/adsr-controls.js";
import "./components/layout/voice-container.js";
import "./components/layout/voice-column.js";
import {
  type MixerControlsValue,
} from "./components/sub-controls/mixer-controls.js";
import {
  type AudioSourceControlsValue,
} from "./components/sub-controls/audio-source-controls.js";
import {
  type VoiceFilterControlsValue,
} from "./components/sub-controls/voice-filter-controls.js";
import {
  MidiContentStreamerEventName,
  type MidiStreamerNoteEvent,
} from "./components/midi-content-streamer.js";

type VoiceState = {
  readonly id: number;
  readonly title: string;
  readonly source: AudioSourceControlsValue;
  readonly adsr: AdsrControlsValue;
  readonly filter: VoiceFilterControlsValue;
};

type MultiVoiceConfig = {
  readonly noteHz: number;
  readonly source: AudioSourceControlsValue;
  readonly adsr: {
    readonly attack: number;
    readonly decay: number;
    readonly sustain: number;
    readonly release: number;
  };
  readonly filter: VoiceFilterControlsValue;
};

type WebAudioMultiVoiceMixerLike = {
  trigger(
    voices: MultiVoiceConfig[],
    mixer: MixerControlsValue,
    options?: { sustain?: boolean },
  ): Promise<void>;
  stop(): void;
};

@customElement("synthesizer-app")
export class SynthesizerApp extends LitElement {
  @state()
  private voices: VoiceState[] = [this.createVoice(1)];
  @state()
  private mixer: MixerControlsValue = {
    masterGain: 1,
    pan: 0,
    muted: false,
    solo: false,
  };
  private nextId = 2;
  private audio: WebAudioMultiVoiceMixerLike | null = null;
  private isPlaying = false;
  private playLoopId: number | null = null;
  private static readonly PLAY_LOOP_MS = 380;
  private readonly onMidiNoteOn = (event: Event): void => {
    void this.handleMidiNoteOn(event as CustomEvent<MidiStreamerNoteEvent>);
  };
  private readonly onMidiNoteOff = (_event: Event): void => {
    this.stop();
  };
  private readonly onMidiStopped = (_event: Event): void => {
    this.stop();
  };

  public override connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener(MidiContentStreamerEventName.NoteOn, this.onMidiNoteOn);
    window.addEventListener(MidiContentStreamerEventName.NoteOff, this.onMidiNoteOff);
    window.addEventListener(MidiContentStreamerEventName.Stopped, this.onMidiStopped);
  }

  public override disconnectedCallback(): void {
    window.removeEventListener(MidiContentStreamerEventName.NoteOn, this.onMidiNoteOn);
    window.removeEventListener(MidiContentStreamerEventName.NoteOff, this.onMidiNoteOff);
    window.removeEventListener(MidiContentStreamerEventName.Stopped, this.onMidiStopped);
    super.disconnectedCallback();
  }

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  protected willUpdate(): void {
    if (!Array.isArray(this.voices)) {
      this.voices = [this.createVoice(1)];
      this.nextId = 2;
      return;
    }

    const safeVoices = this.voices.filter((value): value is VoiceState => {
      return (
        value !== null &&
        typeof value === "object" &&
        "id" in value &&
        "source" in value &&
        "adsr" in value &&
        "filter" in value
      );
    });

    if (safeVoices.length === 0) {
      this.voices = [this.createVoice(1)];
      this.nextId = 2;
    } else if (safeVoices.length !== this.voices.length) {
      this.voices = safeVoices;
    }
  }

  protected render() {
    return html`
      <div class="actions">
        <button @click=${this.play}>Play</button>
        <button @click=${this.stop}>Stop</button>
        <button @click=${this.addVoice}>Add Voice</button>
        <button @click=${this.removeVoice} ?disabled=${this.voices.length <= 1}>
          Remove Voice
        </button>
        <span>${this.voices.length} voices</span>
      </div>

      <div class="synthesizer-app">
        <mixer-controls
          .masterGain=${this.mixer.masterGain}
          .pan=${this.mixer.pan}
          .muted=${this.mixer.muted}
          .solo=${this.mixer.solo}
          @mixer-controls-changed=${(event: CustomEvent<MixerControlsValue>) => {
            this.mixer = event.detail;
            void this.retriggerIfPlaying();
          }}
        ></mixer-controls>

        <section
          class="voices-grid"
          style="display:flex;flex-direction:row;flex-wrap:nowrap;align-items:stretch;gap:12px;overflow-x:auto;padding-bottom:4px;scroll-snap-type:x proximity;"
        >
          ${Array.isArray(this.voices)
            ? this.voices.map((voice, index) => this.renderVoice(voice, index))
            : html``}
        </section>
      </div>
    `;
  }

  private renderVoice(voice: VoiceState, index: number) {
    const source = voice.source ?? {
      type: "osc",
      fileName: "",
      oscillator: "sine",
      gain: 1,
      detuneCents: 0,
      playbackRate: 1,
      loop: false,
    };
    const adsr = voice.adsr ?? {
      attack: 24,
      decay: 40,
      sustain: 89,
      release: 36,
    };
    const filter = voice.filter ?? {
      enabled: true,
      type: "lowpass",
      frequency: 1200,
      q: 1,
    };

    return html`
      <voice-column>
        <voice-container slot="voice" .title=${`Voice ${index + 1}`}>
          <audio-source-controls
            slot="source"
            .type=${source.type}
            .fileName=${source.fileName}
            .oscillator=${source.oscillator}
            .gain=${source.gain}
            .detuneCents=${source.detuneCents}
            .playbackRate=${source.playbackRate}
            .loop=${source.loop}
            @audio-source-controls-changed=${(
              event: CustomEvent<AudioSourceControlsValue>,
            ) => this.updateVoice(voice.id, { source: event.detail })}
          ></audio-source-controls>
          <adsr-controls
            slot="adsr"
            .attack=${adsr.attack}
            .decay=${adsr.decay}
            .sustain=${adsr.sustain}
            .release=${adsr.release}
            @adsr-controls-changed=${(
              event: CustomEvent<AdsrControlsValue>,
            ) => this.updateVoice(voice.id, { adsr: event.detail })}
          ></adsr-controls>
          <voice-filter-controls
            slot="filter"
            .enabled=${filter.enabled}
            .type=${filter.type}
            .frequency=${filter.frequency}
            .q=${filter.q}
            @voice-filter-controls-changed=${(
              event: CustomEvent<VoiceFilterControlsValue>,
            ) => this.updateVoice(voice.id, { filter: event.detail })}
          ></voice-filter-controls>
        </voice-container>
      </voice-column>
    `;
  }

  private play = async (): Promise<void> => {
    if (this.audio === null) {
      const module = await import(
        "../../../music-core-midi-accords-playback/src/web-audio-multi-voice-mixer.js"
      );
      this.audio = new module.WebAudioMultiVoiceMixer();
    }
    if (this.playLoopId !== null) {
      window.clearInterval(this.playLoopId);
      this.playLoopId = null;
    }
    this.isPlaying = true;

    const allOsc = this.voices.every((voice) => voice.source.type === "osc");
    if (allOsc) {
      await this.triggerFrame(true);
      return;
    }

    await this.triggerFrame(false);
    this.playLoopId = window.setInterval(() => {
      void this.triggerFrame(false);
    }, SynthesizerApp.PLAY_LOOP_MS);
  };

  private stop = (): void => {
    this.isPlaying = false;
    if (this.playLoopId !== null) {
      window.clearInterval(this.playLoopId);
      this.playLoopId = null;
    }
    this.audio?.stop();
  };

  private addVoice = (): void => {
    const id = this.nextId++;
    this.voices = [...this.voices, this.createVoice(id)];
  };

  private removeVoice = (): void => {
    if (this.voices.length <= 1) {
      return;
    }
    this.voices = this.voices.slice(0, -1);
  };

  private updateVoice(
    id: number,
    patch: Partial<Pick<VoiceState, "source" | "adsr" | "filter">>,
  ): void {
    const changedAdsr = patch.adsr !== undefined;
    if (patch.adsr !== undefined) {
      const toUnit = (midi: number): number => Math.max(0, Math.min(127, midi)) / 127;

      const normalized = {
        attack: toUnit(patch.adsr.attack),
        decay: toUnit(patch.adsr.decay),
        sustain: toUnit(patch.adsr.sustain),
        release: toUnit(patch.adsr.release),
      };

      console.log("[adsr-controls] changed", {
        voiceId: id,
        midi: patch.adsr,
        normalized,
        envelope: this.mapMidiAdsrToEnvelope(patch.adsr),
      });
    }
    this.voices = this.voices.map((voice) =>
      voice.id === id ? { ...voice, ...patch } : voice,
    );
    if (changedAdsr && this.isPlaying) {
      // Preview ADSR shape with a short gated retrigger so envelope changes are audible.
      void this.triggerFrame(false);
      return;
    }
    void this.retriggerIfPlaying();
  }

  private mapMidiAdsrToEnvelope(adsr: AdsrControlsValue): {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  } {
    const toUnit = (midi: number): number => Math.max(0, Math.min(127, midi)) / 127;
    const expMap = (midi: number, min: number, max: number): number => {
      const t = toUnit(midi);
      return min * Math.pow(max / min, t);
    };

    return {
      attack: expMap(adsr.attack, 0.001, 10),
      decay: expMap(adsr.decay, 0.001, 10),
      sustain: toUnit(adsr.sustain),
      release: expMap(adsr.release, 0.005, 20),
    };
  }

  private async retriggerIfPlaying(): Promise<void> {
    if (!this.isPlaying) {
      return;
    }
    const allOsc = this.voices.every((voice) => voice.source.type === "osc");
    await this.triggerFrame(allOsc);
  }

  private async triggerFrame(sustain: boolean): Promise<void> {
    if (this.audio === null) {
      return;
    }
    const notes = [261.63, 329.63, 392];
    const voices: MultiVoiceConfig[] = this.voices.map((voice, index) => ({
      noteHz: notes[index % notes.length],
      source: voice.source,
      adsr: this.mapMidiAdsrToEnvelope(voice.adsr),
      filter: voice.filter,
    }));
    await this.audio.trigger(voices, this.mixer, { sustain });
  }

  private async handleMidiNoteOn(event: CustomEvent<MidiStreamerNoteEvent>): Promise<void> {
    if (this.audio === null) {
      const module = await import(
        "../../../music-core-midi-accords-playback/src/web-audio-multi-voice-mixer.js"
      );
      this.audio = new module.WebAudioMultiVoiceMixer();
    }

    if (this.playLoopId !== null) {
      window.clearInterval(this.playLoopId);
      this.playLoopId = null;
    }
    this.isPlaying = true;

    const noteHz = 440 * Math.pow(2, (event.detail.noteNumber - 69) / 12);
    const voices: MultiVoiceConfig[] = this.voices.map((voice) => ({
      noteHz,
      source: voice.source,
      adsr: this.mapMidiAdsrToEnvelope(voice.adsr),
      filter: voice.filter,
    }));
    await this.audio.trigger(voices, this.mixer, { sustain: true });
  }

  private createVoice(id: number): VoiceState {
    return {
      id,
      title: `Voice ${id}`,
      source: {
        type: "osc",
        fileName: "",
        file: null,
        oscillator: "sine",
        gain: 1,
        detuneCents: 0,
        playbackRate: 1,
        loop: false,
      },
      adsr: {
        attack: 24,
        decay: 40,
        sustain: 89,
        release: 36,
      },
      filter: {
        enabled: true,
        type: "lowpass",
        frequency: 1200,
        q: 1,
      },
    };
  }

  static styles = css`
    :host {
      display: block;
      min-height: 100svh;
      box-sizing: border-box;
      padding: 20px;
      background: #f4f7ff;
      color: #1c2a4a;
      font-family: "Segoe UI", sans-serif;
    }

    .synthesizer-app {
      width: min(1840px, 100%);
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #d4def3;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    h1 {
      margin: 0 0 12px 0;
      font-size: 20px;
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    }

    button {
      border: 1px solid #c3d2f1;
      background: #ffffff;
      color: #1c2a4a;
      border-radius: 8px;
      padding: 8px 10px;
      cursor: pointer;
    }

    .voices-grid {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      align-items: stretch;
      gap: 12px;
      overflow-x: auto;
      padding-bottom: 4px;
      scroll-snap-type: x proximity;
    }

    voice-column.empty {
      align-items: center;
      justify-content: center;
      border: 1px dashed #c3d2f1;
      border-radius: 10px;
      background: #f8fbff;
      color: #5f7099;
      padding: 12px;
    }

    voice-container {
      display: block;
      height: 100%;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "synthesizer-app": SynthesizerApp;
  }
}
