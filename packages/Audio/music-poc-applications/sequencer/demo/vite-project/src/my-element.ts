// packages/Audio/music-poc-applications/sequencer/demo/vite-project/src/my-element.ts

import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import '../../../../../core.sequencer.ui.resources/src/index.ts';
import './demo-theme.ts';
import { myElementStyles } from './my-element.styles.ts';

import {
  MidiStringParser,
  midiToText,
  SimpleMidiTextFormatter,
  type ParsedSequenceSummary,
  type ParsedStep,
  type MidiString,
} from '@monorepo/music-core-midi';

import {
  WebAudioMidiPlayer,
  RealInstrumentPresets,
  type MidiPlaybackOptions,
} from '@monorepo/music-core-midi-playback';

/* ===================== APPLICATION ===================== */

class MidiSequencePlayer {
  private readonly defaultPlayer: WebAudioMidiPlayer;
  private readonly playersByChannel: ReadonlyMap<number, WebAudioMidiPlayer>;

  public constructor(
    defaultPlayer: WebAudioMidiPlayer,
    playersByChannel?: ReadonlyMap<number, WebAudioMidiPlayer>,
  ) {
    this.defaultPlayer = defaultPlayer;
    this.playersByChannel = playersByChannel ?? new Map<number, WebAudioMidiPlayer>();
  }

  public async play(
    steps: readonly ParsedStep[],
    onStepChanged: (index: number) => void,
  ): Promise<void> {
    let index = 0;

    while (index < steps.length) {
      const firstStep = steps[index];
      const holdMs = firstStep.holdMs;

      if (firstStep.message === null) {
        onStepChanged(index);
        await MidiSequencePlayer.delay(holdMs);
        index += 1;
        continue;
      }

      const groupedSteps: Array<{ readonly index: number; readonly step: ParsedStep }> = [
        { index, step: firstStep },
      ];
      const seenChannels = new Set<number>([firstStep.channel]);
      let cursor = index + 1;

      while (cursor < steps.length) {
        const candidate = steps[cursor];

        if (candidate.message === null || candidate.holdMs !== holdMs || seenChannels.has(candidate.channel)) {
          break;
        }

        groupedSteps.push({ index: cursor, step: candidate });
        seenChannels.add(candidate.channel);
        cursor += 1;
      }

      for (const grouped of groupedSteps) {
        const step = grouped.step;
        const routedPlayer = this.playersByChannel.get(step.channel) ?? this.defaultPlayer;
        const playbackOptions: MidiPlaybackOptions = {
          noteLengthSeconds: Math.max(0.06, step.holdMs / 1000),
          filterFrequency: step.filterInfo1,
          filterQ: step.filterInfo2,
          sustain: step.sustain,
        };

        onStepChanged(grouped.index);
        routedPlayer.play(step.message!, playbackOptions);
      }

      await MidiSequencePlayer.delay(holdMs);
      index = cursor;
    }
  }

  private static delay(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }
}

const SOURCE_MIDI_FILE_URL = new URL('../data/1999 JD_midicities_dot_com.mid', import.meta.url);
const SOURCE_MIDI_FILE_NAME = '1999 JD_midicities_dot_com.mid';
type SynthPreset = Omit<ConstructorParameters<typeof WebAudioMidiPlayer>[0], 'context'>;

/* ===================== UI ===================== */

@customElement('my-element')
export class MyElement extends LitElement {
  private readonly parser = new MidiStringParser();

  private readonly player = this.createPlayerFromPreset(RealInstrumentPresets.analogBrass);
  private readonly channelPlayers: ReadonlyMap<number, WebAudioMidiPlayer> = new Map<number, WebAudioMidiPlayer>([
    [1, this.player],
    [2, this.createPlayerFromPreset(RealInstrumentPresets.warmPad)],
    [3, this.createPlayerFromPreset(RealInstrumentPresets.electricPiano)],
    [4, this.createPlayerFromPreset(RealInstrumentPresets.synthPluck)],
  ]);

  private readonly sequence = new MidiSequencePlayer(this.player, this.channelPlayers);

  private sequenceLabel = 'MIDI File';
  private notesText: MidiString = '';
  private currentStepIndex = -1;
  private galleryOnDigit = 1;
  private isPlaying = false;
  private errorText = '';

  protected override firstUpdated(): void {
    void this.loadMidiFromDataFolder();
  }

  protected render() {
    const parseResult = this.getParseResult();
    const steps = parseResult.steps;
    const summary = parseResult.summary;

    return html`
      <div class="container">
        <h2>Multi-Song MIDI Sequencer</h2>

        <section class="gallery" aria-label="UI component gallery">
          <div class="gallery-header">
            <strong>UI Component Gallery</strong>
            <span>SVG Web Components from core.sequencer.ui.resources</span>
          </div>

          <div class="gallery-preview" aria-label="single digit SVG web component preview">
            <sequencer-digit-button
              .digit=${this.galleryOnDigit}
              .width=${88}
              .height=${88}
              ?selected=${true}
              label-prefix="On"
            ></sequencer-digit-button>

            <sequencer-digit-button
              .digit=${this.galleryOnDigit}
              .width=${88}
              .height=${88}
              ?selected=${false}
              label-prefix="Off"
            ></sequencer-digit-button>
          </div>

          <div class="gallery-scroll">
            <sequencer-digit-button-row
              .selectedDigit=${this.galleryOnDigit}
              .buttonWidth=${88}
              .buttonHeight=${88}
              .gap=${8}
              @digit-selection-change=${this.onGalleryDigitChange}
            ></sequencer-digit-button-row>
          </div>

          <div class="gallery-scroll">
            <sequencer-transport-row
              .buttonWidth=${88}
              .buttonHeight=${56}
              .gap=${8}
            ></sequencer-transport-row>
          </div>

          <div class="gallery-scroll">
            <sequencer-transport-row
              layout="transport-shift"
              .buttonWidth=${88}
              .buttonHeight=${56}
              .gap=${8}
            ></sequencer-transport-row>
          </div>

          <div class="gallery-state">On digit: ${this.galleryOnDigit >= 0 ? this.galleryOnDigit : 'none'}</div>
        </section>

        <label class="field-label" for="notes-input">Source</label>
        <div class="source-name">${SOURCE_MIDI_FILE_NAME}</div>

        <label class="field-label" for="notes-input">MIDI Sequence</label>
        <textarea
          id="notes-input"
          class="notes-input"
          .value=${this.notesText}
          @input=${this.onNotesInput}
          rows="4"
        ></textarea>

        <div class="notes-visualizer" aria-live="polite">
          ${steps.map((step, index) => html`
            <span class=${index === this.currentStepIndex ? 'note active' : 'note'}>${step.token}</span>
          `)}
        </div>

        ${summary !== null ? html`
          <div class="summary-header">
            <strong>MIDI Stream Summary</strong>
            <span>${steps.length} steps | ${summary.totalDurationMs} ms | channels: ${summary.channels.join(', ')}</span>
          </div>

          <div class="summary-grid" role="table" aria-label="MIDI stream summary table">
            <div class="summary-row summary-head" role="row">
              <span>#</span><span>Token</span><span>Status</span><span>Ch</span><span>Note</span>
              <span>Vel</span><span>Hz</span><span>Hold</span><span>F1</span><span>F2</span><span>Sus</span>
            </div>
            ${steps.map((step, index) => {
              const message = step.message;
              const status = message === null ? 'REST' : (message.status === 0x90 ? 'NOTE_ON' : 'NOTE_OFF');
              const noteValue = message === null ? '-' : String(message.note.value());
              const frequency = message === null ? '-' : this.formatFrequency(this.midiToFrequency(message.note.value()));

              return html`
                <div class=${index === this.currentStepIndex ? 'summary-row active' : 'summary-row'} role="row">
                  <span>${index + 1}</span>
                  <span>${step.token}</span>
                  <span>${status}</span>
                  <span>${step.channel}</span>
                  <span>${noteValue}</span>
                  <span>${step.velocity}</span>
                  <span>${frequency}</span>
                  <span>${step.holdMs}</span>
                  <span>${step.filterInfo1 ?? '-'}</span>
                  <span>${step.filterInfo2 ?? '-'}</span>
                  <span>${step.sustain ?? '-'}</span>
                </div>
              `;
            })}
          </div>
        ` : html``}

        <button @click=${this.onPlay} ?disabled=${this.isPlaying}>
          ${this.isPlaying ? 'Playing...' : `Play ${this.getPlayLabel()}`}
        </button>

        ${this.errorText
          ? html`<p class="error" role="alert">${this.errorText}</p>`
          : html``}
      </div>
    `;
  }

  private onNotesInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.notesText = target.value;
    this.sequenceLabel = 'Custom Sequence';
    this.errorText = '';
    this.currentStepIndex = -1;
    this.requestUpdate();
  }

  private getPlayLabel(): string {
    return this.sequenceLabel;
  }

  private onGalleryDigitChange(event: Event): void {
    const customEvent = event as CustomEvent<{ selectedDigit: number }>;
    const digit = customEvent.detail?.selectedDigit;

    if (typeof digit === 'number') {
      this.galleryOnDigit = digit;
      this.requestUpdate();
    }
  }

  private async loadMidiFromDataFolder(): Promise<void> {
    try {
      const response = await fetch(SOURCE_MIDI_FILE_URL);
      if (!response.ok) {
        throw new Error(`Unable to load MIDI file (${response.status}).`);
      }

      const bytes = new Uint8Array(await response.arrayBuffer());
      const midiText = midiToText(bytes, new SimpleMidiTextFormatter());
      const sequence = this.buildSequenceFromMidiText(midiText);

      this.notesText = sequence;
      this.sequenceLabel = SOURCE_MIDI_FILE_NAME;
      this.errorText = '';
      this.currentStepIndex = -1;
    } catch (error) {
      this.errorText = error instanceof Error ? error.message : 'Failed to load MIDI file.';
      this.currentStepIndex = -1;
    }

    this.requestUpdate();
  }

  private buildSequenceFromMidiText(midiText: string): MidiString {
    const noteOnLines = midiText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => /^\d+:\s+NoteOn\s+ch=\d+\s+note=\d+\s+vel=\d+$/i.test(line));

    const events = noteOnLines
      .map((line) => {
        const match = /^(\d+):\s+NoteOn\s+ch=(\d+)\s+note=(\d+)\s+vel=(\d+)$/i.exec(line);
        if (!match) {
          return null;
        }

        const absoluteTime = Number(match[1]);
        const channel = Number(match[2]);
        const note = Number(match[3]);
        const velocity = Number(match[4]);

        if (!Number.isFinite(absoluteTime) || !Number.isFinite(channel) || !Number.isFinite(note) || !Number.isFinite(velocity)) {
          return null;
        }

        if (velocity <= 0) {
          return null;
        }

        return { absoluteTime, channel, note, velocity };
      })
      .filter((event): event is { absoluteTime: number; channel: number; note: number; velocity: number } => event !== null);

    if (events.length === 0) {
      throw new Error('No playable NoteOn events were found in the MIDI file.');
    }

    const tokens = events.map((event, index) => {
      const nextEvent = events[index + 1];
      const deltaTicks = nextEvent ? Math.max(1, nextEvent.absoluteTime - event.absoluteTime) : 48;
      const holdMs = Math.min(1500, Math.max(45, deltaTicks * 4));

      return `N${event.note}-h${holdMs}-v${event.velocity}-ch${event.channel}`;
    });

    return tokens.join(' ');
  }

  private createPlayerFromPreset(
    preset: SynthPreset,
  ): WebAudioMidiPlayer {
    return new WebAudioMidiPlayer({
      envelope: preset.envelope,
      filter: preset.filter,
      filterEnvelope: preset.filterEnvelope,
      noteLengthSeconds: preset.noteLengthSeconds,
      detuneCents: preset.detuneCents,
      filterEnvAmount: preset.filterEnvAmount,
      velocityToFilter: preset.velocityToFilter,
      subLevel: preset.subLevel,
      panSpread: preset.panSpread,
    });
  }

  private async onPlay(): Promise<void> {
    if (this.isPlaying) {
      return;
    }

    this.isPlaying = true;
    this.errorText = '';
    this.requestUpdate();

    try {
      const parseResult = this.parser.parseWithSummary(this.notesText);
      const steps = parseResult.steps;

      await this.sequence.play(steps, (index) => {
        this.currentStepIndex = index;
        this.requestUpdate();
      });

      this.currentStepIndex = -1;
    } catch (error) {
      this.errorText = error instanceof Error ? error.message : 'Failed to parse or play notes.';
      this.currentStepIndex = -1;
    } finally {
      this.isPlaying = false;
      this.requestUpdate();
    }
  }

  private getParseResult(): { readonly steps: readonly ParsedStep[]; readonly summary: ParsedSequenceSummary | null } {
    try {
      const parsed = this.parser.parseWithSummary(this.notesText);
      return {
        steps: parsed.steps,
        summary: parsed.summary,
      };
    } catch {
      return {
        steps: [],
        summary: null,
      };
    }
  }

  private midiToFrequency(note: number): number {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  private formatFrequency(value: number): string {
    return `${value.toFixed(1)}Hz`;
  }

  static styles = myElementStyles;
}
