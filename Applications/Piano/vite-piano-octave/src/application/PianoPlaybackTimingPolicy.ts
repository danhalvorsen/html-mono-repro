import type { AccordStep } from "../music/Accords";
import type { ProjectedSongStep } from "./MidiSongProjector";

export interface IPianoPlaybackTimingPolicy {
  applyPlaybackSpeed(value: number, speed: number): number;
  applySignalRate(value: number, rate: number): number;
  scaleAccordSteps(
    steps: readonly AccordStep[],
    scale: number
  ): readonly AccordStep[];
  normalizeProjectedDuration(
    steps: readonly ProjectedSongStep[],
    targetDurationMs?: number
  ): readonly ProjectedSongStep[];
  getSafePlaybackSpeed(speed: number): number;
  getSafeMidiSignalRate(rate: number): number;
}

export class PianoPlaybackTimingPolicy implements IPianoPlaybackTimingPolicy {
  private static readonly MIN_PLAYBACK_SPEED = 0.001;
  private static readonly MAX_PLAYBACK_SPEED = 1;
  private static readonly MIN_MIDI_SIGNAL_RATE = 0.05;
  private static readonly MAX_MIDI_SIGNAL_RATE = 4;

  public applyPlaybackSpeed(value: number, speed: number): number {
    return Math.max(1, Math.round(value / this.getSafePlaybackSpeed(speed)));
  }

  public applySignalRate(value: number, rate: number): number {
    return Math.max(1, Math.round(value / this.getSafeMidiSignalRate(rate)));
  }

  public scaleAccordSteps(
    steps: readonly AccordStep[],
    scale: number
  ): readonly AccordStep[] {
    return steps.map((step) => ({
      ...step,
      waitBeforeMs: Math.max(0, Math.round((step.waitBeforeMs ?? 0) * scale)),
      holdMs: Math.max(60, Math.round((step.holdMs ?? 120) * scale))
    }));
  }

  public normalizeProjectedDuration(
    steps: readonly ProjectedSongStep[],
    targetDurationMs?: number
  ): readonly ProjectedSongStep[] {
    if (
      targetDurationMs === undefined ||
      !Number.isFinite(targetDurationMs) ||
      targetDurationMs <= 0
    ) {
      return steps;
    }

    const naturalDurationMs = steps.reduce(
      (maxValue, step) => Math.max(maxValue, step.startMs + step.holdMs),
      0
    );

    if (naturalDurationMs <= 0) {
      return steps;
    }

    const scale = targetDurationMs / naturalDurationMs;
    return steps.map((step) => ({
      ...step,
      startMs: Math.max(0, Math.round(step.startMs * scale)),
      holdMs: Math.max(60, Math.round(step.holdMs * scale))
    }));
  }

  public getSafePlaybackSpeed(speed: number): number {
    if (!Number.isFinite(speed)) {
      return 1;
    }

    return Math.min(
      PianoPlaybackTimingPolicy.MAX_PLAYBACK_SPEED,
      Math.max(PianoPlaybackTimingPolicy.MIN_PLAYBACK_SPEED, speed)
    );
  }

  public getSafeMidiSignalRate(rate: number): number {
    if (!Number.isFinite(rate)) {
      return 1;
    }

    return Math.min(
      PianoPlaybackTimingPolicy.MAX_MIDI_SIGNAL_RATE,
      Math.max(PianoPlaybackTimingPolicy.MIN_MIDI_SIGNAL_RATE, rate)
    );
  }
}

