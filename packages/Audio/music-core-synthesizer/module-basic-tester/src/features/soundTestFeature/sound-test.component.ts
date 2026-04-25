// packages/Audio/music-core-synthesizer/module-basic-tester/src/features/soundTestFeature/sound-test.component.ts

import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";

import {
  createNoteOn,
  createNoteOff,
  MidiChannel,
  MidiNote,
  MidiVelocity,
} from "@monorepo/music-core-midi";

import type { IVoiceDefinition } from "@monorepo/music-core-synthesizer-contracts";
import {
  OscillatorWaveform,
  FilterType,
  DistortionType,
} from "@monorepo/music-core-synthesizer-contracts";

import {
  SynthEngine,
  MidiMessageRouter,
  NoteLifetimeCoordinator,
  StaticVoiceDefinitionProvider,
  EqualTemperamentMidiNoteFrequencyMapper,
} from "@monorepo/music-core-synthesizer-engine";

import {
  WebAudioContextFactory,
  WebAudioMasterBus,
  WebAudioVoiceFactory,
  WebAudioVoiceGraphBuilder,
  WebAudioEnvelopeScheduler,
  WebAudioWhiteNoiseSourceFactory,
} from "@monorepo/music-core-synthesizer-web-audio";

/* ============================================================================
   Internal controller (kept private to component)
============================================================================ */

class TimeProvider {
  constructor(private readonly ctx: AudioContext) {}
  now() {
    return this.ctx.currentTime;
  }
}

class SoundController {
  private engine: SynthEngine | null = null;

  public async init(): Promise<void> {
    if (this.engine) return;

    const ctx = new WebAudioContextFactory().create();
    await ctx.resume();

    const master = new WebAudioMasterBus(ctx, 0.8);
    master.connect(ctx.destination);

    const graphBuilder = new WebAudioVoiceGraphBuilder(
      new WebAudioWhiteNoiseSourceFactory(),
    );

    const voiceFactory = new WebAudioVoiceFactory(
      graphBuilder,
      new WebAudioEnvelopeScheduler(),
    );

    const voiceDef: IVoiceDefinition = {
      oscillator: {
        waveform: OscillatorWaveform.Sawtooth,
        detuneCents: 0,
        gain: 0.8,
      },
      noise: { enabled: false, gain: 0 },
      envelope: {
        attackSeconds: 0.01,
        decaySeconds: 0.1,
        sustainLevel: 0.7,
        releaseSeconds: 0.25,
      },
      filter: {
        enabled: false,
        type: FilterType.LowPass,
        cutoffHz: 2000,
        resonanceQ: 0.7,
      },
      distortion: {
        enabled: false,
        type: DistortionType.None,
        amount: 0,
      },
    };

    const provider = new StaticVoiceDefinitionProvider(voiceDef);

    const coordinator = new NoteLifetimeCoordinator({
      voiceFactory: {
        create: (r) =>
          voiceFactory.create({
            context: ctx,
            destination: master.input,
            definition: r.definition,
            note: r.note,
            velocity: r.velocity,
            frequencyHz: r.frequencyHz,
            startedAt: r.startedAt,
          }),
      },
      frequencyMapper: new EqualTemperamentMidiNoteFrequencyMapper(),
      voiceDefinitionProvider: provider,
    });

    const router = new MidiMessageRouter({
      timeProvider: new TimeProvider(ctx),
      coordinator,
    });

    this.engine = new SynthEngine({ router, coordinator }, voiceDef);
  }

  public noteOn(note: number): void {
    this.engine?.handle(
      createNoteOn(
        MidiChannel.create(1),
        MidiNote.create(note),
        MidiVelocity.create(110),
      ),
    );
  }

  public noteOff(note: number): void {
    this.engine?.handle(
      createNoteOff(
        MidiChannel.create(1),
        MidiNote.create(note),
        MidiVelocity.Zero,
      ),
    );
  }
}

/* ============================================================================
   Lit component
============================================================================ */

@customElement("sound-test")
export class SoundTestComponent extends LitElement {
  private readonly controller = new SoundController();

  static styles = css`
    :host {
      display: block;
      padding: 16px;
      font-family: sans-serif;
    }

    button {
      margin-right: 8px;
      padding: 8px 12px;
      font-size: 14px;
    }
  `;

  render() {
    return html`
      <h1>Sound Test</h1>

      <button
        @pointerdown=${this.onDown}
        @pointerup=${this.onUp}
        @pointerleave=${this.onUp}
      >
        Hold C4
      </button>

      <button @click=${this.onStop}>
        Stop
      </button>
    `;
  }

  private onDown = async () => {
    await this.controller.init(); // user gesture
    this.controller.noteOn(60);
  };

  private onUp = () => {
    this.controller.noteOff(60);
  };

  private onStop = () => {
    this.controller.noteOff(60);
  };
}