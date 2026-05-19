import { LitElement, css, html, type TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import {
  MidiEventEngine,
  type MidiLogicalEvent,
} from "@monorepo/music-core-midi-accords-playback";

export type MidiStreamerNoteEvent = {
  readonly channel: number;
  readonly noteNumber: number;
  readonly velocity: number;
  readonly timestampMs: number;
};

export const MidiContentStreamerEventName = Object.freeze({
  NoteOn: "midi-content-streamer-note-on",
  NoteOff: "midi-content-streamer-note-off",
  Started: "midi-content-streamer-started",
  Stopped: "midi-content-streamer-stopped",
} as const);

@customElement("midi-content-streamer")
export class MidiContentStreamer extends LitElement {
  @state()
  private fileName = "";
  @state()
  private isStreaming = false;
  @state()
  private noteOnCount = 0;
  @state()
  private noteOffCount = 0;

  private readonly engine = new MidiEventEngine();
  private events: readonly MidiLogicalEvent[] = [];
  private selectedFile: File | null = null;
  private timeouts: number[] = [];

  protected override render(): TemplateResult {
    return html`
      <fieldset>
        <legend>MIDI Content Streamer</legend>
        <label class="row">
          <span>MIDI file</span>
          <input type="file" accept=".mid,.midi,audio/midi,audio/x-midi" @change=${this.onFileChange} />
          <small>${this.fileName || "No MIDI file selected"}</small>
        </label>

        <div class="actions">
          <button @click=${this.startStreaming} ?disabled=${this.selectedFile === null || this.isStreaming}>
            Stream MIDI
          </button>
          <button @click=${this.stopStreaming} ?disabled=${!this.isStreaming}>Stop Stream</button>
          <span>${this.noteOnCount} on / ${this.noteOffCount} off</span>
        </div>
      </fieldset>
    `;
  }

  private onFileChange = async (event: Event): Promise<void> => {
    const target = event.currentTarget as HTMLInputElement;
    this.selectedFile = target.files?.[0] ?? null;
    this.fileName = this.selectedFile?.name ?? "";
    this.events = [];
    this.noteOnCount = 0;
    this.noteOffCount = 0;

    if (this.selectedFile === null) {
      return;
    }

    const bytes = new Uint8Array(await this.selectedFile.arrayBuffer());
    const song = {
      get: () => this.bytesToBinaryString(bytes),
    };
    this.events = this.engine.play(song);
  };

  private startStreaming = (): void => {
    if (this.events.length === 0 || this.isStreaming) {
      return;
    }

    this.stopStreaming();
    this.isStreaming = true;
    this.dispatchEvent(new CustomEvent(MidiContentStreamerEventName.Started, { bubbles: true, composed: true }));

    for (const event of this.events) {
      if (event.kind !== "note-on" && event.kind !== "note-off") {
        continue;
      }

      const timeoutId = window.setTimeout(() => {
        if (!this.isStreaming) {
          return;
        }
        if (event.kind === "note-on") {
          this.noteOnCount += 1;
          this.dispatchEvent(
            new CustomEvent<MidiStreamerNoteEvent>(MidiContentStreamerEventName.NoteOn, {
              detail: {
                channel: event.channel + 1,
                noteNumber: event.noteNumber,
                velocity: event.velocity,
                timestampMs: event.timestampMs,
              },
              bubbles: true,
              composed: true,
            }),
          );
          return;
        }

        this.noteOffCount += 1;
        this.dispatchEvent(
          new CustomEvent<MidiStreamerNoteEvent>(MidiContentStreamerEventName.NoteOff, {
            detail: {
              channel: event.channel + 1,
              noteNumber: event.noteNumber,
              velocity: event.velocity,
              timestampMs: event.timestampMs,
            },
            bubbles: true,
            composed: true,
          }),
        );
      }, Math.max(0, Math.floor(event.timestampMs)));
      this.timeouts.push(timeoutId);
    }

    const totalMs = Math.max(...this.events.map((event) => event.timestampMs), 0) + 16;
    const endId = window.setTimeout(() => {
      this.stopStreaming();
    }, Math.floor(totalMs));
    this.timeouts.push(endId);
  };

  private stopStreaming = (): void => {
    for (const timeoutId of this.timeouts) {
      window.clearTimeout(timeoutId);
    }
    this.timeouts = [];

    if (!this.isStreaming) {
      return;
    }
    this.isStreaming = false;
    this.dispatchEvent(new CustomEvent(MidiContentStreamerEventName.Stopped, { bubbles: true, composed: true }));
  };

  private bytesToBinaryString(bytes: Uint8Array): string {
    let value = "";
    for (const byte of bytes) {
      value += String.fromCharCode(byte);
    }
    return value;
  }

  static override styles = css`
    :host {
      display: block;
    }
    fieldset {
      margin: 0;
      padding: 10px;
      border-radius: 8px;
      border: 1px solid #2b3a5d;
      background: #10182a;
    }
    legend {
      padding: 0 6px;
      color: #b8c8ec;
      font-size: 12px;
    }
    .row {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 10px;
      font-size: 12px;
      color: #a7b5d8;
    }
    .actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      color: #a7b5d8;
      font-size: 12px;
    }
    button,
    input[type="file"] {
      border: 1px solid #365186;
      border-radius: 6px;
      padding: 6px 8px;
      background: #172543;
      color: #dce8ff;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "midi-content-streamer": MidiContentStreamer;
  }
}
