import { describe, expect, it, vi } from "vitest";
import { DefaultPianoRootPlaybackService } from "../src/application/playback/DefaultPianoRootPlaybackService";
import type { IMidiSongProjector } from "../src/application/IMidiSongProjector";
import type { IPianoOctavePlayback } from "../src/application/playback/IPianoOctavePlayback";
import type { IProjectedSongAccordStepMapper } from "../src/application/IProjectedSongAccordStepMapper";
import type { ITaskScheduler } from "../src/application/scheduling/ITaskScheduler";
import { PianoPlaybackTimingPolicy } from "../src/application/playback/PianoPlaybackTimingPolicy";
import type { ProjectedSongStep } from "../src/application/projection/MidiSongProjector";
import type { AccordStep } from "../src/music/Accords";

class ImmediateTaskScheduler implements ITaskScheduler {
  public schedule(_delayMs: number, action: () => void): void {
    action();
  }
}

class FakeMidiSongProjector implements IMidiSongProjector {
  public readonly projectFromUrlMock = vi.fn(async (_url: string) => {
    const steps: readonly ProjectedSongStep[] = [
      { octaveIndex: 0, note: "C", startMs: 0, holdMs: 180 },
      { octaveIndex: 1, note: "E", startMs: 150, holdMs: 200 }
    ];
    return steps;
  });

  public projectFromUrl(url: string): Promise<readonly ProjectedSongStep[]> {
    return this.projectFromUrlMock(url);
  }
}

class DefaultProjectedSongAccordStepMapperStub
  implements IProjectedSongAccordStepMapper
{
  public mapByOctave(
    song: readonly ProjectedSongStep[],
    octaveIndex: number
  ): readonly AccordStep[] {
    const filtered = song
      .filter((step) => step.octaveIndex === octaveIndex)
      .sort((left, right) => left.startMs - right.startMs);

    let previousStartMs = 0;
    return filtered.map((step) => {
      const waitBeforeMs = Math.max(0, step.startMs - previousStartMs);
      previousStartMs = step.startMs;

      return {
        notes: [step.note],
        waitBeforeMs,
        holdMs: step.holdMs
      };
    });
  }
}

class FakePianoOctavePlayback implements IPianoOctavePlayback {
  public readonly playDemoChordsMock = vi.fn();
  public readonly playAccordsMock = vi.fn();

  public playDemoChords(): void {
    this.playDemoChordsMock();
  }

  public playAccords(
    progression: readonly AccordStep[],
    stepWaitMs: number,
    holdMs: number
  ): void {
    this.playAccordsMock(progression, stepWaitMs, holdMs);
  }
}

describe("DefaultPianoRootPlaybackService", () => {
  it("should trigger demo playback for each octave", () => {
    const projector = new FakeMidiSongProjector();
    const mapper = new DefaultProjectedSongAccordStepMapperStub();
    const service = new DefaultPianoRootPlaybackService({
      midiSongProjector: projector,
      projectedSongAccordStepMapper: mapper,
      timingPolicy: new PianoPlaybackTimingPolicy(),
      taskScheduler: new ImmediateTaskScheduler()
    });

    const octaveA = new FakePianoOctavePlayback();
    const octaveB = new FakePianoOctavePlayback();
    service.playDemoChords([octaveA, octaveB], 2, 1);

    expect(octaveA.playDemoChordsMock).toHaveBeenCalledTimes(1);
    expect(octaveB.playDemoChordsMock).toHaveBeenCalledTimes(1);
  });

  it("should project midi song and dispatch mapped steps", async () => {
    const projector = new FakeMidiSongProjector();
    const mapper = new DefaultProjectedSongAccordStepMapperStub();
    const service = new DefaultPianoRootPlaybackService({
      midiSongProjector: projector,
      projectedSongAccordStepMapper: mapper,
      timingPolicy: new PianoPlaybackTimingPolicy(),
      taskScheduler: new ImmediateTaskScheduler()
    });

    const octaveA = new FakePianoOctavePlayback();
    const octaveB = new FakePianoOctavePlayback();

    await service.playMidiSongFromUrl(
      [octaveA, octaveB],
      "/song.mid",
      1,
      1
    );

    expect(projector.projectFromUrlMock).toHaveBeenCalledWith("/song.mid");
    expect(octaveA.playAccordsMock).toHaveBeenCalledTimes(1);
    expect(octaveB.playAccordsMock).toHaveBeenCalledTimes(1);
  });
});

