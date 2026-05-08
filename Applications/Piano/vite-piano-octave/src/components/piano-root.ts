import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./piano-octave";
import "./piano-waterfall";
import type { PianoOctave } from "./piano-octave";
import type { IPianoOctavePlayback } from "../application/IPianoOctavePlayback";
import type { IPianoRootPlaybackService } from "../application/IPianoRootPlaybackService";
import { PianoRootCompositionRoot } from "../composition/PianoRootCompositionRoot";

@customElement("piano-root")
export class PianoRoot extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .stage {
      position: relative;
      width: max-content;
      max-width: 100%;
    }

    .waterfall-slot {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: var(--waterfall-height);
      z-index: 2;
      pointer-events: none;
    }

    .piano-row {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      gap: 0;
      overflow-x: auto;
      padding-top: var(--waterfall-height);
      padding-bottom: 6px;
      position: relative;
      z-index: 1;
    }

    .piano-row piano-octave {
      flex: 0 0 640px;
    }
  `;

  @property({ type: Number })
  octaves = 4;

  @property({ type: String })
  octaveHeight = "200px";

  @property({ type: Number })
  gap = 6;

  @property({ type: Number })
  maxSimultaneousOctaves = 2; // human-like: two hands

  @property({ type: Number })
  midiTempoBpm = 130;

  @property({ type: Number })
  playbackSpeed = 1;

  @property({ type: Number })
  midiSignalRate = 1;

  private readonly playbackService: IPianoRootPlaybackService =
    new PianoRootCompositionRoot().composePlaybackService();

  private getOctaves(): readonly IPianoOctavePlayback[] {
    return Array.from(this.renderRoot.querySelectorAll("piano-octave")) as PianoOctave[];
  }

  public playDemoChords(): void {
    this.playbackService.playDemoChords(
      this.getOctaves(),
      this.maxSimultaneousOctaves,
      this.playbackSpeed
    );
  }

  public async playMidiSongFromUrl(url: string, targetDurationMs?: number): Promise<void> {
    await this.playbackService.playMidiSongFromUrl(
      this.getOctaves(),
      url,
      this.playbackSpeed,
      this.midiSignalRate,
      targetDurationMs
    );
  }

  public playGriegConcertoTheme(): void {
    this.playbackService.playGriegConcertoTheme(
      this.getOctaves(),
      this.maxSimultaneousOctaves,
      this.playbackSpeed,
      this.midiSignalRate
    );
  }

  render() {
    const waterfallHeight = `calc(${this.octaveHeight} * 3)`;

    return html`
      <div class="stage" style="--waterfall-height: ${waterfallHeight};">
        <div class="waterfall-slot">
          <slot name="waterfall"></slot>
        </div>

        <div class="piano-row">
          ${Array.from({ length: this.octaves }, (_, i) => html`
            <piano-octave
              id=${`octave-${i + 1}`}
              .octaveIndex=${i}
              .gap=${this.gap}
              width="640px"
              .height=${this.octaveHeight}
            ></piano-octave>
          `)}
        </div>
      </div>
    `;
  }
}
