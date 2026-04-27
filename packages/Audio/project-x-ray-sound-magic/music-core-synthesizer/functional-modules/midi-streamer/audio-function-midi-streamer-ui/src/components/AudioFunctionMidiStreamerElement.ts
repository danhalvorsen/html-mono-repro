import {
  MidiStreamerDomEvents,
  type IMidiSongStreamer,
  type MidiSong,
  type MidiStreamCompleted,
  type MidiStreamFailure,
  type MidiStreamMessage,
  type MidiStreamSubscription,
} from "@monorepo/audio-function-midi-streamer-contracts";
import { css, html, LitElement, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

import { DomMidiStreamSink } from "../internal/DomMidiStreamSink.js";

export const AudioFunctionMidiStreamerElementTagName =
  "audio-function-midi-streamer";

@customElement(AudioFunctionMidiStreamerElementTagName)
export class AudioFunctionMidiStreamerElement extends LitElement {
  public static override readonly styles = css`
    :host {
      display: block;
      box-sizing: border-box;
      font-family: system-ui, sans-serif;
    }

    :host([disabled]) {
      opacity: 0.7;
    }

    .root {
      display: grid;
      gap: 0.75rem;
    }

    .field {
      display: grid;
      gap: 0.25rem;
    }

    label {
      font-size: 0.875rem;
      font-weight: 600;
    }

    select {
      min-height: 2rem;
      font: inherit;
    }

    .toolbar {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      align-items: center;
    }

    button {
      padding: 0.5rem 0.75rem;
      font: inherit;
      cursor: pointer;
    }

    button:disabled,
    select:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }

    .status {
      font-size: 0.75rem;
      opacity: 0.8;
    }
  `;

  @property({ attribute: false })
  public songs: readonly MidiSong[] = [];

  @property({ attribute: false })
  public streamer: IMidiSongStreamer | null = null;

  @property({ type: Boolean, reflect: true })
  public disabled = false;

  @state()
  private selectedSongId = "";

  @state()
  private isPlaying = false;

  @state()
  private statusText = "No songs loaded";

  private currentSubscription: MidiStreamSubscription | null = null;

  public override disconnectedCallback(): void {
    this.stopCurrentStream(false);
    super.disconnectedCallback();
  }

  protected override willUpdate(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has("disabled") && this.disabled) {
      this.stopCurrentStream(true);
    }

    if (changedProperties.has("songs")) {
      this.syncSelectedSongBeforeUpdate();
    }
  }

  protected override render(): TemplateResult {
    const hasSongs = this.songs.length > 0;
    const canPlay = !this.disabled && !this.isPlaying && hasSongs;

    return html`
      <section class="root">
        <div class="field">
          <label for="song-selector">Song</label>

          <select
            id="song-selector"
            .value=${this.selectedSongId}
            ?disabled=${this.disabled || this.isPlaying || !hasSongs}
            @change=${this.handleSongChanged}
          >
            ${repeat(
              this.songs,
              (song) => song.id,
              (song) => html`
                <option value=${song.id}>${song.title}</option>
              `,
            )}
          </select>
        </div>

        <div class="toolbar">
          <button
            type="button"
            ?disabled=${!canPlay}
            @click=${this.playSelectedSong}
          >
            Play
          </button>

          <button
            type="button"
            ?disabled=${this.disabled || !this.isPlaying}
            @click=${this.stopByUser}
          >
            Stop
          </button>
        </div>

        <div class="status" role="status" aria-live="polite">
          ${this.statusText}
        </div>

        <slot name="midi-data"></slot>
      </section>
    `;
  }

  private syncSelectedSongBeforeUpdate(): void {
    if (this.songs.length === 0) {
      this.selectedSongId = "";
      this.statusText = "No songs loaded";
      return;
    }

    const selectedStillExists = this.songs.some(
      (song) => song.id === this.selectedSongId,
    );

    if (!selectedStillExists) {
      this.selectedSongId = this.songs[0]?.id ?? "";
    }

    if (!this.isPlaying) {
      this.statusText = `${this.songs.length} song(s) loaded`;
    }

    this.dispatchEvent(
      new CustomEvent(MidiStreamerDomEvents.songsLoaded, {
        bubbles: true,
        composed: true,
        detail: {
          count: this.songs.length,
        },
      }),
    );
  }

  private readonly handleSongChanged = (event: Event): void => {
    const target = event.target;

    if (!(target instanceof HTMLSelectElement)) {
      return;
    }

    this.selectedSongId = target.value;

    const selectedSong = this.getSelectedSong();

    this.statusText =
      selectedSong === null
        ? `Selected song not found: ${target.value}`
        : `Selected: ${selectedSong.title}`;
  };

  private readonly playSelectedSong = (): void => {
    if (this.disabled || this.isPlaying) {
      return;
    }

    const song = this.getSelectedSong();

    if (song === null) {
      this.publishFailure(`Song not found: ${this.selectedSongId}`);
      return;
    }

    if (this.streamer === null) {
      this.publishFailure("No MIDI song streamer has been configured.");
      return;
    }

    this.stopCurrentStream(false);

    this.isPlaying = true;
    this.statusText = `Playing: ${song.title}`;

    this.dispatchEvent(
      new CustomEvent(MidiStreamerDomEvents.songSelected, {
        bubbles: true,
        composed: true,
        detail: {
          songId: song.id,
          title: song.title,
        },
      }),
    );

    this.currentSubscription = this.streamer.stream(
      song,
      new DomMidiStreamSink(this, {
        onMidiStreamMessage: (event) => this.onMidiStreamMessage(event),
        onMidiStreamCompleted: (event) => this.onMidiStreamCompleted(event),
        onMidiStreamFailed: (error) => this.onMidiStreamFailed(error),
      }),
    );
  };

  private readonly stopByUser = (): void => {
    this.stopCurrentStream(true);
  };

  private onMidiStreamMessage(event: MidiStreamMessage): void {
    this.statusText =
      `Playing event ${event.eventIndex + 1}/${this.getSelectedSong()?.events.length ?? "?"}`;
  }

  private onMidiStreamCompleted(_event: MidiStreamCompleted): void {
    this.currentSubscription = null;
    this.isPlaying = false;
    this.statusText = "Completed";
  }

  private onMidiStreamFailed(error: MidiStreamFailure): void {
    this.currentSubscription = null;
    this.isPlaying = false;
    this.statusText = `Failed: ${error.message}`;
  }

  private stopCurrentStream(updateStatus: boolean): void {
    if (this.currentSubscription !== null) {
      this.currentSubscription.cancel();
      this.currentSubscription = null;
    }

    this.isPlaying = false;

    if (updateStatus) {
      this.statusText = "Stopped";
    }
  }

  private getSelectedSong(): MidiSong | null {
    return this.songs.find((song) => song.id === this.selectedSongId) ?? null;
  }

  private publishFailure(message: string): void {
    this.stopCurrentStream(false);
    this.statusText = `Failed: ${message}`;

    this.dispatchEvent(
      new CustomEvent(MidiStreamerDomEvents.streamFailed, {
        bubbles: true,
        composed: true,
        detail: {
          songId: this.selectedSongId,
          message,
        },
      }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "audio-function-midi-streamer": AudioFunctionMidiStreamerElement;
  }
}
