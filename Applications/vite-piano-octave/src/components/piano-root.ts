import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./piano-octave";
import "./piano-waterfall";
import type { PianoOctave } from "./piano-octave";
import type { AccordStep } from "../music/Accords";
import { MidiSongProjector, toAccordStepsByOctave } from "../application/MidiSongProjector";
import type { ProjectedSongStep } from "../application/MidiSongProjector";

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

  private readonly midiSongProjector = new MidiSongProjector();

  private getOctaves(): PianoOctave[] {
    return Array.from(this.renderRoot.querySelectorAll("piano-octave")) as PianoOctave[];
  }

  public playDemoChords(): void {
    const octaves = this.getOctaves();
    if (octaves.length === 0) return;

    const groupSize = Math.max(1, this.maxSimultaneousOctaves);
    const groupDelayMs = this.applyPlaybackSpeed(1400);

    octaves.forEach((octave, index) => {
      const groupIndex = Math.floor(index / groupSize);
      window.setTimeout(() => octave.playDemoChords(), groupIndex * groupDelayMs);
    });
  }

  public async playMidiSongFromUrl(url: string, targetDurationMs?: number): Promise<void> {
    const octaves = this.getOctaves();
    if (octaves.length === 0) return;

    const projectedRaw = await this.midiSongProjector.projectFromUrl(url);
    const projected = this.normalizeProjectedDuration(projectedRaw, targetDurationMs);
    const timingScale = 1 / (this.getSafePlaybackSpeed() * this.getSafeMidiSignalRate());

    for (let octaveIndex = 0; octaveIndex < octaves.length; octaveIndex++) {
      const steps = this.scaleAccordSteps(toAccordStepsByOctave(projected, octaveIndex), timingScale);
      if (steps.length === 0) continue;
      octaves[octaveIndex].playAccords(steps, 120, 180);
    }
  }

  private scaleAccordSteps(steps: readonly AccordStep[], scale: number): readonly AccordStep[] {
    return steps.map((step) => ({
      ...step,
      waitBeforeMs: Math.max(0, Math.round((step.waitBeforeMs ?? 0) * scale)),
      holdMs: Math.max(60, Math.round((step.holdMs ?? 120) * scale))
    }));
  }

  private normalizeProjectedDuration(
    steps: readonly ProjectedSongStep[],
    targetDurationMs?: number
  ): readonly ProjectedSongStep[] {
    if (!targetDurationMs || !Number.isFinite(targetDurationMs) || targetDurationMs <= 0) {
      return steps;
    }

    const naturalDurationMs = steps.reduce(
      (max, step) => Math.max(max, step.startMs + step.holdMs),
      0
    );
    if (naturalDurationMs <= 0) return steps;

    const scale = targetDurationMs / naturalDurationMs;
    return steps.map((step) => ({
      ...step,
      startMs: Math.max(0, Math.round(step.startMs * scale)),
      holdMs: Math.max(60, Math.round(step.holdMs * scale))
    }));
  }

  private getSafePlaybackSpeed(): number {
    if (!Number.isFinite(this.playbackSpeed)) return 1;
    return Math.min(1, Math.max(0.001, this.playbackSpeed));
  }

  private getSafeMidiSignalRate(): number {
    if (!Number.isFinite(this.midiSignalRate)) return 1;
    return Math.min(4, Math.max(0.05, this.midiSignalRate));
  }

  private applyPlaybackSpeed(ms: number): number {
    return Math.max(1, Math.round(ms / this.getSafePlaybackSpeed()));
  }

  private applySignalRate(ms: number): number {
    return Math.max(1, Math.round(ms / this.getSafeMidiSignalRate()));
  }

  public playGriegConcertoTheme(): void {
    const octaves = this.getOctaves();
    if (octaves.length === 0) return;

    // Public-domain Grieg Piano Concerto (A minor) inspired opening progression.
    const theme: readonly AccordStep[] = [
      { notes: ["A", "C", "E"], waitBeforeMs: 0, holdMs: 1300 },
      { notes: ["E", "A", "C"], waitBeforeMs: 1400, holdMs: 1200 },
      { notes: ["D", "F", "A"], waitBeforeMs: 1300, holdMs: 1250 },
      { notes: ["E", "Gs", "H"], waitBeforeMs: 1350, holdMs: 1300 },
      { notes: ["A", "C", "E"], waitBeforeMs: 1450, holdMs: 1600 }
    ];

    const groupSize = Math.max(1, this.maxSimultaneousOctaves);
    const handOffsetMs = this.applySignalRate(this.applyPlaybackSpeed(220));

    octaves.forEach((octave, index) => {
      const groupIndex = Math.floor(index / groupSize);
      window.setTimeout(() => {
        octave.playAccords(
          this.scaleAccordSteps(
            theme,
            (1 / this.getSafePlaybackSpeed()) / this.getSafeMidiSignalRate()
          ),
          this.applySignalRate(this.applyPlaybackSpeed(1300)),
          this.applyPlaybackSpeed(1250)
        );
      }, groupIndex * handOffsetMs);
    });
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
