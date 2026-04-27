import { css, html, LitElement, type PropertyValues } from "lit";
import {
  MidiStreamerDomEvents,
  type IMidiSongStreamer,
  type MidiSong,
  type MidiStreamSubscription,
} from "@monorepo/audio-function-midi-streamer-contracts";
import { DomMidiStreamSink } from "../internal/DomMidiStreamSink.js";
import { MidiSongCatalogJsonParser } from "../internal/MidiSongCatalogJsonParser.js";

export class AudioFunctionMidiStreamerElement extends LitElement {
  public static override readonly styles = css`
    :host {
      display: block;
      box-sizing: border-box;
      font-family: system-ui, sans-serif;
    }

    .root {
      display: grid;
      gap: 0.5rem;
    }

    label {
      display: grid;
      gap: 0.25rem;
      font-size: 0.875rem;
    }

    select {
      min-height: 2rem;
      font: inherit;
    }

    .status {
      font-size: 0.75rem;
      opacity: 0.75;
    }
  `;

  public static override readonly properties = {
    songs: { attribute: false },
    songSourceUrl: { attribute: "song-source-url" },
    selectedSongId: { state: true },
    disabled: { type: Boolean, reflect: true },
  };

  public songs: readonly MidiSong[] = [];
  public songSourceUrl = "";
  public selectedSongId = "";
  public disabled = false;
  public streamer: IMidiSongStreamer | undefined = undefined;

  private readonly parser = new MidiSongCatalogJsonParser();
  private currentSubscription: MidiStreamSubscription | undefined = undefined;

  public override disconnectedCallback(): void {
    this.stopCurrentStream();
    super.disconnectedCallback();
  }

  protected override updated(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has("songSourceUrl")) {
      void this.loadSongsFromSourceUrl();
    }

    if (changedProperties.has("songs") && this.selectedSongId.length === 0) {
      this.selectedSongId = this.songs[0]?.id ?? "";
    }
  }

  protected override render(): unknown {
    const hasSongs = this.songs.length > 0;

    return html`
      <section class="root">
        <label>
          Song
          <select
            .value=${this.selectedSongId}
            ?disabled=${this.disabled || !hasSongs}
            @change=${this.handleSongChanged}
          >
            ${this.songs.map(
              (song) => html`
                <option value=${song.id}>${song.title}</option>
              `,
            )}
          </select>
        </label>

        <div class="status">
          ${hasSongs ? `${this.songs.length} song(s) loaded` : "No songs loaded"}
        </div>

        <slot name="midi-data"></slot>
      </section>
    `;
  }

  private async loadSongsFromSourceUrl(): Promise<void> {
    const sourceUrl = this.songSourceUrl.trim();

    if (sourceUrl.length === 0) {
      return;
    }

    try {
      const response = await fetch(sourceUrl);

      if (!response.ok) {
        throw new Error(`Failed to load MIDI songs. HTTP status: ${response.status}.`);
      }

      const json = (await response.json()) as unknown;
      this.songs = this.parser.parse(json);
      this.selectedSongId = this.songs[0]?.id ?? "";

      this.dispatchEvent(
        new CustomEvent(MidiStreamerDomEvents.songsLoaded, {
          bubbles: true,
          composed: true,
          detail: {
            count: this.songs.length,
          },
        }),
      );
    } catch (error) {
      this.dispatchFailure(this.getErrorMessage(error));
    }
  }

  private handleSongChanged(event: Event): void {
    const target = event.target;

    if (!(target instanceof HTMLSelectElement)) {
      return;
    }

    this.selectedSongId = target.value;
    this.streamSelectedSong();
  }

  private streamSelectedSong(): void {
    const song = this.songs.find((candidate) => candidate.id === this.selectedSongId);

    if (song === undefined) {
      this.dispatchFailure(`Song not found: ${this.selectedSongId}`);
      return;
    }

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

    if (this.streamer === undefined) {
      this.dispatchFailure("No MIDI song streamer has been configured.");
      return;
    }

    this.stopCurrentStream();
    this.currentSubscription = this.streamer.stream(song, new DomMidiStreamSink(this));
  }

  private stopCurrentStream(): void {
    if (this.currentSubscription === undefined) {
      return;
    }

    this.currentSubscription.cancel();
    this.currentSubscription = undefined;
  }

  private dispatchFailure(message: string): void {
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

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return "Unknown MIDI streamer error.";
  }
}