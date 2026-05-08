import type { AccordStep } from "../music/Accords";
import type { IMidiSongProjector } from "./IMidiSongProjector";
import type { IPianoOctavePlayback } from "./IPianoOctavePlayback";
import type { IPianoRootPlaybackService } from "./IPianoRootPlaybackService";
import type { IProjectedSongAccordStepMapper } from "./IProjectedSongAccordStepMapper";
import type { ITaskScheduler } from "./ITaskScheduler";
import type { IPianoPlaybackTimingPolicy } from "./PianoPlaybackTimingPolicy";

export class DefaultPianoRootPlaybackService
  implements IPianoRootPlaybackService
{
  private readonly midiSongProjector: IMidiSongProjector;
  private readonly projectedSongAccordStepMapper: IProjectedSongAccordStepMapper;
  private readonly timingPolicy: IPianoPlaybackTimingPolicy;
  private readonly taskScheduler: ITaskScheduler;

  public constructor(options: {
    readonly midiSongProjector: IMidiSongProjector;
    readonly projectedSongAccordStepMapper: IProjectedSongAccordStepMapper;
    readonly timingPolicy: IPianoPlaybackTimingPolicy;
    readonly taskScheduler: ITaskScheduler;
  }) {
    this.midiSongProjector = options.midiSongProjector;
    this.projectedSongAccordStepMapper = options.projectedSongAccordStepMapper;
    this.timingPolicy = options.timingPolicy;
    this.taskScheduler = options.taskScheduler;
  }

  public playDemoChords(
    octaves: readonly IPianoOctavePlayback[],
    maxSimultaneousOctaves: number,
    playbackSpeed: number
  ): void {
    if (octaves.length === 0) {
      return;
    }

    const groupSize = Math.max(1, maxSimultaneousOctaves);
    const groupDelayMs = this.timingPolicy.applyPlaybackSpeed(1400, playbackSpeed);

    octaves.forEach((octave, index) => {
      const groupIndex = Math.floor(index / groupSize);
      this.taskScheduler.schedule(groupIndex * groupDelayMs, () => {
        octave.playDemoChords();
      });
    });
  }

  public playGriegConcertoTheme(
    octaves: readonly IPianoOctavePlayback[],
    maxSimultaneousOctaves: number,
    playbackSpeed: number,
    midiSignalRate: number
  ): void {
    if (octaves.length === 0) {
      return;
    }

    const theme: readonly AccordStep[] = [
      { notes: ["A", "C", "E"], waitBeforeMs: 0, holdMs: 1300 },
      { notes: ["E", "A", "C"], waitBeforeMs: 1400, holdMs: 1200 },
      { notes: ["D", "F", "A"], waitBeforeMs: 1300, holdMs: 1250 },
      { notes: ["E", "Gs", "H"], waitBeforeMs: 1350, holdMs: 1300 },
      { notes: ["A", "C", "E"], waitBeforeMs: 1450, holdMs: 1600 }
    ];

    const groupSize = Math.max(1, maxSimultaneousOctaves);
    const handOffsetMs = this.timingPolicy.applySignalRate(
      this.timingPolicy.applyPlaybackSpeed(220, playbackSpeed),
      midiSignalRate
    );

    const timingScale =
      (1 / this.timingPolicy.getSafePlaybackSpeed(playbackSpeed)) /
      this.timingPolicy.getSafeMidiSignalRate(midiSignalRate);

    octaves.forEach((octave, index) => {
      const groupIndex = Math.floor(index / groupSize);
      this.taskScheduler.schedule(groupIndex * handOffsetMs, () => {
        octave.playAccords(
          this.timingPolicy.scaleAccordSteps(theme, timingScale),
          this.timingPolicy.applySignalRate(
            this.timingPolicy.applyPlaybackSpeed(1300, playbackSpeed),
            midiSignalRate
          ),
          this.timingPolicy.applyPlaybackSpeed(1250, playbackSpeed)
        );
      });
    });
  }

  public async playMidiSongFromUrl(
    octaves: readonly IPianoOctavePlayback[],
    url: string,
    playbackSpeed: number,
    midiSignalRate: number,
    targetDurationMs?: number
  ): Promise<void> {
    if (octaves.length === 0) {
      return;
    }

    const projectedRaw = await this.midiSongProjector.projectFromUrl(url);
    const projected = this.timingPolicy.normalizeProjectedDuration(
      projectedRaw,
      targetDurationMs
    );

    const timingScale =
      1 /
      (this.timingPolicy.getSafePlaybackSpeed(playbackSpeed) *
        this.timingPolicy.getSafeMidiSignalRate(midiSignalRate));

    for (let octaveIndex = 0; octaveIndex < octaves.length; octaveIndex += 1) {
      const mappedSteps = this.projectedSongAccordStepMapper.mapByOctave(
        projected,
        octaveIndex
      );
      const scaledSteps = this.timingPolicy.scaleAccordSteps(
        mappedSteps,
        timingScale
      );

      if (scaledSteps.length === 0) {
        continue;
      }

      octaves[octaveIndex].playAccords(scaledSteps, 120, 180);
    }
  }
}

