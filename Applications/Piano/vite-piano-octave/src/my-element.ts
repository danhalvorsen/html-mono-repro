import { LitElement, html, css } from "lit";
import { SongFileSource } from "./application/SongFileSources";
import "./components/piano-root";
import "./components/piano-waterfall";
import type { PianoRoot } from "./components/piano-root";

export class MyElement extends LitElement {
  private static readonly GRIEG_WEDDING_DAY_DURATION_MS = 6 * 60 * 1000 + 29 * 1000;
  private static readonly MIN_PLAYBACK_SPEED = 0.001;
  private static readonly MAX_PLAYBACK_SPEED = 1;
  private static readonly MIN_SIGNAL_RATE = 0.05;
  private static readonly MAX_SIGNAL_RATE = 4;

  static styles = css`
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

  private onPlayDemoClick = () => {
    const piano = this.renderRoot.querySelector("#piano") as PianoRoot | null;
    piano?.playDemoChords();
  };

  private onPlayGriegClick = () => {
    const piano = this.renderRoot.querySelector("#piano") as PianoRoot | null;
    piano?.playGriegConcertoTheme();
  };

  private onPlayWeddingDayMidiClick = async () => {
    const piano = this.renderRoot.querySelector("#piano") as PianoRoot | null;
    await piano?.playMidiSongFromUrl(
      SongFileSource.GriegWeddingDay,
      MyElement.GRIEG_WEDDING_DAY_DURATION_MS
    );
  };

  private setPlaybackSpeed(next: number): void {
    if (!Number.isFinite(next)) return;
    const clamped = Math.min(
      MyElement.MAX_PLAYBACK_SPEED,
      Math.max(MyElement.MIN_PLAYBACK_SPEED, next)
    );
    this.playbackSpeed = clamped;
    this.requestUpdate();
  }

  private onPlaybackSpeedRangeInput = (event: Event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    this.setPlaybackSpeed(Number(target.value));
  };

  private onPlaybackSpeedNumberInput = (event: Event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    this.setPlaybackSpeed(Number(target.value));
  };

  private setMidiSignalRate(next: number): void {
    if (!Number.isFinite(next)) return;
    const clamped = Math.min(
      MyElement.MAX_SIGNAL_RATE,
      Math.max(MyElement.MIN_SIGNAL_RATE, next)
    );
    this.midiSignalRate = clamped;
    this.requestUpdate();
  }

  private onMidiSignalRateRangeInput = (event: Event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    this.setMidiSignalRate(Number(target.value));
  };

  private onMidiSignalRateNumberInput = (event: Event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    this.setMidiSignalRate(Number(target.value));
  };

  render() {
    return html`
      <h1>Piano (1 Octave)</h1>
      <piano-root
        id="piano"
        .octaves=${1}
        octaveHeight="400px"
        .gap=${6}
        .playbackSpeed=${this.playbackSpeed}
        .midiSignalRate=${this.midiSignalRate}
      >
        <piano-waterfall slot="waterfall" .octaves=${1}></piano-waterfall>
      </piano-root>
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
