import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { Converter, abcFromEvents$ } from "@monorepo/hello-notes-deterministic-adapters";
import { from, firstValueFrom } from "rxjs";
import * as abcjs from "abcjs";
import { createNoteOn, MidiChannel, MidiNote, MidiVelocity, type MidiMessage } from "@monorepo/music-core-midi";
import { RealInstrumentPresets, WebAudioMidiPlayer } from "@monorepo/music-core-midi-playback";
import type { MidiLogicalEvent } from "@monorepo/music-core-midi-accords-playback";

@customElement("view-midi-converter")
export class ViewMidiConverter extends LitElement {
  @state()
  private midiInput = "C4-h500-v92-ch1 C4-h500-v92-ch1 G4-h500-v92-ch1 G4-h500-v92-ch1 A4-h500-v92-ch1 A4-h500-v92-ch1 G4-h1000-v92-ch1 F4-h500-v88-ch1 F4-h500-v88-ch1 E4-h500-v88-ch1 E4-h500-v88-ch1 D4-h500-v88-ch1 D4-h500-v88-ch1 C4-h1000-v88-ch1";

  @state()
  private abcInput = "";

  @state()
  private errorText = "";

  @state()
  private isPlaying = false;

  private readonly converter = new Converter();
  private midiPlayer: WebAudioMidiPlayer | null = null;
  private readonly scheduledHandles: number[] = [];

  protected render() {
    return html`
      <main>
        <h1>MIDI Text to ABCJS</h1>
        <p>Paste MIDI note text and press Enter to convert and render.</p>

        <label for="midi-input">MIDI input text</label>
        <textarea
          id="midi-input"
          .value=${this.midiInput}
          @input=${this.onInput}
          @keydown=${this.onKeyDown}
          placeholder="Example: C4-h500-v92-ch1 D4-h500-v92-ch1 E4-h1000-v92-ch1"
          rows="4"
        ></textarea>

        <small>Press Enter to convert. Use Shift+Enter for newline.</small>
        <div class="actions">
          <button type="button" @click=${this.onPlayClick} ?disabled=${this.isPlaying}>
            ${this.isPlaying ? "Playing..." : "Play"}
          </button>
        </div>

        ${this.errorText ? html`<pre class="error">${this.errorText}</pre>` : html``}

        <section>
          <h2>ABC notation input</h2>
          <textarea
            id="abc-input"
            .value=${this.abcInput}
            @input=${this.onAbcInput}
            @keydown=${this.onAbcKeyDown}
            placeholder="Paste ABC notation here and press Enter to render"
            rows="8"
          ></textarea>
          <small>Press Enter to render ABC. Use Shift+Enter for newline.</small>
        </section>

        <section>
          <h2>Rendered score</h2>
          <div id="abc-output" aria-live="polite"></div>
        </section>
      </main>
    `;
  }

  private onInput = (event: Event): void => {
    const target = event.target as HTMLTextAreaElement;
    this.midiInput = target.value;
  };

  private onKeyDown = async (event: KeyboardEvent): Promise<void> => {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }
    event.preventDefault();
    await this.convertAndRender();
  };

  private onAbcInput = (event: Event): void => {
    const target = event.target as HTMLTextAreaElement;
    this.abcInput = target.value;
  };

  private onAbcKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }
    event.preventDefault();
    this.renderAbcInput();
  };

  private onPlayClick = async (): Promise<void> => {
    const input = this.midiInput.trim();
    if (input.length === 0) {
      this.errorText = "Input is empty. Paste MIDI note text first.";
      return;
    }

    try {
      this.errorText = "";
      const songLike = { get: () => input };
      const events = this.converter.convert(songLike);
      const noteOnEvents = events
        .filter((event): event is Extract<MidiLogicalEvent, { kind: "note-on" }> => event.kind === "note-on")
        .sort((a, b) => a.timestampMs - b.timestampMs);

      this.playNoteOnEventsAsAccords(noteOnEvents);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.errorText = `Playback failed: ${message}`;
      this.stopScheduledPlayback();
    }
  };

  private async convertAndRender(): Promise<void> {
    const input = this.midiInput.trim();
    if (input.length === 0) {
      this.errorText = "Input is empty. Paste MIDI note text first.";
      this.abcInput = "";
      this.clearScore();
      return;
    }

    try {
      this.errorText = "";
      const songLike = { get: () => input };
      const events = this.converter.convert(songLike);
      const abc = await firstValueFrom(abcFromEvents$(from(events)));
      this.abcInput = abc;
      this.renderScore(abc);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.errorText = `Conversion failed: ${message}`;
      this.abcInput = "";
      this.clearScore();
    }
  }

  private renderAbcInput(): void {
    const abc = this.abcInput.trim();
    if (abc.length === 0) {
      this.errorText = "ABC input is empty. Paste ABC notation first.";
      this.clearScore();
      return;
    }

    try {
      this.errorText = "";
      this.renderScore(abc);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.errorText = `ABC render failed: ${message}`;
      this.clearScore();
    }
  }

  private renderScore(abc: string): void {
    const mount = this.renderRoot.querySelector("#abc-output") as HTMLElement | null;
    if (mount === null) {
      return;
    }
    mount.replaceChildren();
    abcjs.renderAbc(mount, abc, {
      responsive: "resize",
      add_classes: true
    });
  }

  private clearScore(): void {
    const mount = this.renderRoot.querySelector("#abc-output") as HTMLElement | null;
    if (mount !== null) {
      mount.replaceChildren();
    }
  }

  public override disconnectedCallback(): void {
    this.stopScheduledPlayback();
    super.disconnectedCallback();
  }

  private playNoteOnEventsAsAccords(events: readonly Extract<MidiLogicalEvent, { kind: "note-on" }>[]): void {
    if (events.length === 0) {
      this.errorText = "No playable note-on events found.";
      return;
    }

    const player = this.getMidiPlayer();
    if (player === null) {
      this.errorText = "Could not initialize MIDI player.";
      return;
    }

    this.stopScheduledPlayback();
    this.isPlaying = true;

    const baseMs = events[0]!.timestampMs;
    const accordGroups = this.groupByAccordStart(events);
    let endMs = 0;

    for (const group of accordGroups) {
      const startOffsetMs = Math.max(0, Math.round(group.timestampMs - baseMs));

      this.scheduledHandles.push(
        window.setTimeout(() => {
          for (const event of group.events) {
            const onMessage = this.createMessage(event.channel, event.noteNumber, event.velocity);
            const noteLengthSeconds = Math.max(0.01, event.durationMs / 1000);
            player.play(onMessage, {
              noteLengthSeconds,
              sustain: 0.6,
            });
          }
        }, startOffsetMs),
      );

      for (const event of group.events) {
        const durationMs = Math.max(1, Math.round(event.durationMs));
        const noteOffOffsetMs = startOffsetMs + durationMs;
        endMs = Math.max(endMs, noteOffOffsetMs);
      }
    }

    this.scheduledHandles.push(
      window.setTimeout(() => {
        this.isPlaying = false;
        this.scheduledHandles.length = 0;
      }, endMs + 60),
    );
  }

  private groupByAccordStart(
    events: readonly Extract<MidiLogicalEvent, { kind: "note-on" }>[],
  ): readonly {
    readonly timestampMs: number;
    readonly events: readonly Extract<MidiLogicalEvent, { kind: "note-on" }>[];
  }[] {
    const byTimestamp = new Map<number, Extract<MidiLogicalEvent, { kind: "note-on" }>[]>();
    for (const event of events) {
      const key = Math.round(event.timestampMs);
      const existing = byTimestamp.get(key);
      if (existing === undefined) {
        byTimestamp.set(key, [event]);
        continue;
      }
      existing.push(event);
    }

    return Array.from(byTimestamp.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([timestampMs, grouped]) => ({
        timestampMs,
        events: grouped.sort((a, b) => a.noteNumber - b.noteNumber),
      }));
  }

  private stopScheduledPlayback(): void {
    for (const handle of this.scheduledHandles) {
      window.clearTimeout(handle);
    }
    this.scheduledHandles.length = 0;
    this.isPlaying = false;
  }

  private getMidiPlayer(): WebAudioMidiPlayer | null {
    if (this.midiPlayer !== null) {
      return this.midiPlayer;
    }

    try {
      this.midiPlayer = new WebAudioMidiPlayer({
        ...RealInstrumentPresets.synthPluck,
      });
      return this.midiPlayer;
    } catch {
      return null;
    }
  }

  private createMessage(
    channel: number,
    note: number,
    velocity: number,
  ): MidiMessage {
    const midiChannel = MidiChannel.create(channel);
    const midiNote = MidiNote.create(note);
    return createNoteOn(midiChannel, midiNote, MidiVelocity.create(velocity));
  }

  static styles = css`
    :host {
      display: block;
      color: #111111;
    }

    main {
      max-width: 980px;
    }

    h1 {
      margin: 0 0 0.5rem;
      font-size: 1.8rem;
      color: #111111;
    }

    h2 {
      margin: 1.5rem 0 0.5rem;
      font-size: 1.05rem;
      color: #111111;
    }

    p {
      margin: 0 0 1rem;
      color: #374151;
    }

    label {
      display: block;
      font-weight: 600;
      margin-bottom: 0.4rem;
      color: #111111;
    }

    textarea {
      width: 100%;
      box-sizing: border-box;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 0.75rem;
      background: #ffffff;
      color: #111111;
      font: 14px/1.5 Consolas, Menlo, Monaco, monospace;
    }

    small {
      display: block;
      margin-top: 0.5rem;
      color: #4b5563;
    }

    .actions {
      margin-top: 0.75rem;
    }

    button {
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 0.45rem 0.9rem;
      background: #ffffff;
      color: #111111;
      cursor: pointer;
      font-weight: 600;
    }

    button:disabled {
      opacity: 0.6;
      cursor: default;
    }

    pre {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-word;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 0.75rem;
      background: #ffffff;
      color: #111111;
      font: 13px/1.5 Consolas, Menlo, Monaco, monospace;
    }

    .error {
      margin-top: 1rem;
      border-color: #7f1d1d;
      background: #fef2f2;
      color: #991b1b;
    }

    #abc-output {
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 0.5rem;
      overflow-x: auto;
      background: #ffffff;
      min-height: 100px;
    }

    #abc-output svg {
      background: #ffffff;
    }

    #abc-output :is(path, line, text, .abcjs-note, .abcjs-staff, .abcjs-bar) {
      stroke: #111111;
      fill: #111111;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "view-midi-converter": ViewMidiConverter;
  }
}
