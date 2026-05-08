import { LitElement, css, html, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./piano-octave";
import "./piano-waterfall";
import type { PianoOctave } from "./piano-octave";
import type { IPianoOctavePlayback } from "../application/IPianoOctavePlayback";
import type { IPianoRootPlaybackService } from "../application/IPianoRootPlaybackService";
import { PianoRootCompositionRoot } from "../composition/PianoRootCompositionRoot";

@customElement("piano-root")
export class PianoRoot extends LitElement {
  public static override styles = css`
    :host {
      display: block;
    }

    .stage-scroll {
      display: block;
      width: 100%;
      max-width: 100vw;
      overflow-x: auto;
      overflow-y: visible;
    }

    .surface {
      position: relative;
      width: max-content;
      min-width: 100%;
    }

    .waterfall-layer {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: var(--waterfall-height);
      z-index: 2;
      pointer-events: none;
    }

    .waterfall-layer piano-waterfall {
      display: block;
      width: 100%;
      height: 100%;
    }

    .piano-row {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      gap: 0;
      padding-top: var(--waterfall-height);
      padding-bottom: 6px;
      position: relative;
      z-index: 1;
    }

    .piano-row piano-octave {
      flex: 0 0 var(--octave-width);
    }
  `;

  @property({ type: Number })
  public octaves = 7;

  @property({ type: String })
  public octaveWidth = "320px";

  @property({ type: String })
  public octaveHeight = "220px";

  @property({ type: Number })
  public gap = 6;

  @property({ type: Number })
  public maxSimultaneousOctaves = 2;

  @property({ type: Number })
  public midiTempoBpm = 130;

  @property({ type: Number })
  public playbackSpeed = 1;

  @property({ type: Number })
  public midiSignalRate = 1;

  private readonly playbackService: IPianoRootPlaybackService =
    new PianoRootCompositionRoot().composePlaybackService();

  public playDemoChords(): void {
    this.playbackService.playDemoChords(
      this.getOctaves(),
      this.maxSimultaneousOctaves,
      this.playbackSpeed
    );
  }

  public async playMidiSongFromUrl(
    url: string,
    targetDurationMs?: number
  ): Promise<void> {
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

  protected override render(): TemplateResult {
    const safeOctaves = this.getSafeOctaveCount();
    const waterfallHeight = `calc(${this.octaveHeight} * 3)`;

    return html`
      <div class="stage-scroll">
        <div
          class="surface"
          style="
            --waterfall-height: ${waterfallHeight};
            --octave-width: ${this.octaveWidth};
          "
        >
          <div class="waterfall-layer">
            <piano-waterfall .octaves=${safeOctaves}></piano-waterfall>
          </div>

          <div class="piano-row">
            ${Array.from({ length: safeOctaves }, (_, index) => html`
              <piano-octave
                id=${`octave-${index + 1}`}
                .octaveIndex=${index}
                .gap=${this.gap}
                .width=${this.octaveWidth}
                .height=${this.octaveHeight}
              ></piano-octave>
            `)}
          </div>
        </div>
      </div>
    `;
  }

  private getOctaves(): readonly IPianoOctavePlayback[] {
    return Array.from(
      this.renderRoot.querySelectorAll("piano-octave")
    ) as PianoOctave[];
  }

  private getSafeOctaveCount(): number {
    if (!Number.isInteger(this.octaves) || this.octaves < 1) {
      return 1;
    }

    return this.octaves;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "piano-root": PianoRoot;
  }
}