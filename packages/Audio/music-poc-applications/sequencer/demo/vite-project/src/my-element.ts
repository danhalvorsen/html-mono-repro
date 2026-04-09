// packages/Audio/music-poc-applications/sequencer/demo/vite-project/src/my-element.ts

import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';

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

  static styles = css`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
      box-sizing: border-box;
    }

    .container {
      width: min(760px, 96vw);
      display: grid;
      gap: 14px;
      background: #121620;
      border: 1px solid #2f3c56;
      border-radius: 12px;
      padding: 16px;
      color: #e8ecf4;
    }

    h2 {
      margin: 0;
      font-size: 1.1rem;
      letter-spacing: 0.02em;
    }

    .field-label {
      font-size: 0.84rem;
      color: #aab7d3;
    }

    .source-name {
      width: 100%;
      border-radius: 8px;
      border: 1px solid #3f4f70;
      background: #0f1420;
      color: #f5f7ff;
      padding: 8px;
      box-sizing: border-box;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 0.87rem;
    }

    .notes-input {
      width: 100%;
      border-radius: 8px;
      border: 1px solid #3f4f70;
      background: #0f1420;
      color: #f5f7ff;
      padding: 10px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 0.95rem;
      line-height: 1.4;
      resize: vertical;
      box-sizing: border-box;
    }

    .notes-visualizer {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      min-height: 42px;
      padding: 10px;
      border-radius: 8px;
      border: 1px solid #2c3851;
      background: #0b1018;
    }

    .summary-header {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      font-size: 0.84rem;
      color: #b9c6df;
    }

    .summary-grid {
      border: 1px solid #2c3851;
      border-radius: 8px;
      background: #0b1018;
      overflow: auto;
      max-height: 240px;
    }

    .summary-row {
      display: grid;
      grid-template-columns: 38px minmax(120px, 1fr) 72px 44px 54px 54px 72px 56px 60px 60px 60px;
      gap: 8px;
      align-items: center;
      padding: 7px 10px;
      border-bottom: 1px solid #1a2435;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 0.78rem;
      color: #c5d0e6;
    }

    .summary-row:last-child {
      border-bottom: none;
    }

    .summary-head {
      position: sticky;
      top: 0;
      background: #111b2e;
      color: #f1f5ff;
      font-weight: 700;
      z-index: 1;
    }

    .summary-row.active {
      background: #2c3f6d;
      color: #fff3c7;
    }

    .note {
      display: inline-flex;
      align-items: center;
      padding: 3px 8px;
      border-radius: 8px;
      border: 1px solid #34435f;
      color: #c5d0e6;
      background: #131b2a;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 0.86rem;
      transition: transform 90ms ease, background-color 90ms ease, color 90ms ease;
    }

    .note.active {
      background: #ffd166;
      border-color: #ffbe3d;
      color: #121212;
      transform: translateY(-1px) scale(1.03);
      font-weight: 700;
    }

    button {
      justify-self: start;
      border: 1px solid #6c86c9;
      background: #3453a5;
      color: #f8fbff;
      border-radius: 8px;
      padding: 8px 14px;
      font-size: 0.95rem;
      cursor: pointer;
    }

    button:disabled {
      opacity: 0.6;
      cursor: default;
    }

    .error {
      margin: 0;
      color: #ff8d8d;
      font-size: 0.9rem;
    }
  `;
}