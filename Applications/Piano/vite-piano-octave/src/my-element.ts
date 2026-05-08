import { LitElement, html, css, type TemplateResult } from "lit";
import { SongFileSource } from "./application/SongFileSources";
import "./components/piano-root";
import type { PianoRoot } from "./components/piano-root";

export class MyElement extends LitElement {
  private static readonly OCTAVE_COUNT = 7;
  private static readonly OCTAVE_WIDTH = "320px";
  private static readonly OCTAVE_HEIGHT = "220px";
  private static readonly GRIEG_WEDDING_DAY_DURATION_MS = 6 * 60 * 1000 + 29 * 1000;
  private static readonly MIN_PLAYBACK_SPEED = 0.001;
  private static readonly MAX_PLAYBACK_SPEED = 1;
  private static readonly MIN_SIGNAL_RATE = 0.05;
  private static readonly MAX_SIGNAL_RATE = 4;

  public static override styles = css`
    :host {
      display: block;
      padding: 16px;
      font-family: system-ui, sans-serif;
    }

    .actions {
      margin-top: 12px;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .controls {
      margin-top: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .controls input[type="number"] {
      width: 90px;
      padding: 4px 6px;
    }

    button {
      padding: 8px 12px;
      border: 1px solid #b8b8b8;
      border-radius: 6px;
      background: #f5f5f5;
      cursor: pointer;
    }
  `;

  private playbackSpeed = 1;
  private midiSignalRate = 1;

  private readonly onPlayDemoClick = (): void => {
    const piano = this.renderRoot.querySelector("#piano") as PianoRoot | null;
    piano?.playDemoChords();
  };

  private readonly onPlayGriegClick = (): void => {
    const piano = this.renderRoot.querySelector("#piano") as PianoRoot | null;
    piano?.playGriegConcertoTheme();
  };

  private readonly onPlayWeddingDayMidiClick = async (): Promise<void> => {
    const piano = this.renderRoot.querySelector("#piano") as PianoRoot | null;

    await piano?.playMidiSongFromUrl(
      SongFileSource.GriegWeddingDay,
      MyElement.GRIEG_WEDDING_DAY_DURATION_MS
    );
  };

  private setPlaybackSpeed(next: number): void {
    if (!Number.isFinite(next)) {
      return;
    }

    this.playbackSpeed = Math.min(
      MyElement.MAX_PLAYBACK_SPEED,
      Math.max(MyElement.MIN_PLAYBACK_SPEED, next)
    );

    this.requestUpdate();
  }

  private readonly onPlaybackSpeedRangeInput = (event: Event): void => {
    const target = event.target;

    if (target instanceof HTMLInputElement) {
      this.setPlaybackSpeed(Number(target.value));
    }
  };

  private readonly onPlaybackSpeedNumberInput = (event: Event): void => {
    const target = event.target;

    if (target instanceof HTMLInputElement) {
      this.setPlaybackSpeed(Number(target.value));
    }
  };

  private setMidiSignalRate(next: number): void {
    if (!Number.isFinite(next)) {
      return;
    }

    this.midiSignalRate = Math.min(
      MyElement.MAX_SIGNAL_RATE,
      Math.max(MyElement.MIN_SIGNAL_RATE, next)
    );

    this.requestUpdate();
  }

  private readonly onMidiSignalRateRangeInput = (event: Event): void => {
    const target = event.target;

    if (target instanceof HTMLInputElement) {
      this.setMidiSignalRate(Number(target.value));
    }
  };

  private readonly onMidiSignalRateNumberInput = (event: Event): void => {
    const target = event.target;

    if (target instanceof HTMLInputElement) {
      this.setMidiSignalRate(Number(target.value));
    }
  };

  protected override render(): TemplateResult {
    return html`
      <h1>Piano (${MyElement.OCTAVE_COUNT} Octaves)</h1>

      <piano-root
        id="piano"
        .octaves=${MyElement.OCTAVE_COUNT}
        .octaveWidth=${MyElement.OCTAVE_WIDTH}
        .octaveHeight=${MyElement.OCTAVE_HEIGHT}
        .gap=${6}
        .playbackSpeed=${this.playbackSpeed}
        .midiSignalRate=${this.midiSignalRate}
      ></piano-root>

      <div class="controls">
        <label for="playback-speed">Playback Speed</label>
        <input
          id="playback-speed"
          type="range"
          min="0.001"
          max="1"
          step="0.001"
          .value=${String(this.playbackSpeed)}
          @input=${this.onPlaybackSpeedRangeInput}
        />
        <input
          id="playback-speed-number"
          type="number"
          min="0.001"
          max="1"
          step="0.001"
          .value=${this.playbackSpeed.toFixed(3)}
          @input=${this.onPlaybackSpeedNumberInput}
        />
        <span>${this.playbackSpeed.toFixed(3)}x</span>
      </div>

      <div class="controls">
        <label for="midi-signal-rate">MIDI Signal Rate</label>
        <input
          id="midi-signal-rate"
          type="range"
          min="0.05"
          max="4"
          step="0.01"
          .value=${String(this.midiSignalRate)}
          @input=${this.onMidiSignalRateRangeInput}
        />
        <input
          id="midi-signal-rate-number"
          type="number"
          min="0.05"
          max="4"
          step="0.01"
          .value=${this.midiSignalRate.toFixed(2)}
          @input=${this.onMidiSignalRateNumberInput}
        />
        <span>${this.midiSignalRate.toFixed(2)}x</span>
      </div>

      <div class="actions">
        <button type="button" @click=${this.onPlayDemoClick}>Play Demo Chords</button>
        <button type="button" @click=${this.onPlayGriegClick}>Play Grieg Theme</button>
        <button type="button" @click=${this.onPlayWeddingDayMidiClick}>Play Wedding Day MIDI</button>
      </div>
    `;
  }
}

customElements.define("my-element", MyElement);