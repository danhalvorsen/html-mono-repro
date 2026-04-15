// packages/Audio/music-core-synthesizer/tests/fixture/SequencerProjectDocumentBuilder.ts

import type { SequencerProjectDocumentDto } from "../../src/dto.js";
import type { components } from "../../src/generated/schema-types.js";

export interface IBuilder<T> {
  build(): T;
}

type ProjectDto = components["schemas"]["Project"];
type ProjectComponentsDto = components["schemas"]["ProjectComponents"];
type PlaybackSettingsDto = components["schemas"]["PlaybackSettings"];
type PatternDto = components["schemas"]["Pattern"];
type SampleComponentDto = components["schemas"]["SampleComponent"];
type SampleWindowDto = components["schemas"]["SampleWindow"];
type StepDto = components["schemas"]["Step"];
type TrackDto = components["schemas"]["Track"];
type TrackDefaultsDto = components["schemas"]["TrackDefaults"];
type StepStateDto = components["schemas"]["StepState"];
type TrackKindDto = components["schemas"]["TrackKind"];
type MuteStateDto = components["schemas"]["MuteState"];

export class SampleWindowBuilder implements IBuilder<SampleWindowDto> {
  public constructor(
    private readonly value: SampleWindowDto = {
      start: 0,
      end: 1,
    },
  ) {}

  public withStart(start: number): SampleWindowBuilder {
    return new SampleWindowBuilder({
      ...this.value,
      start,
    });
  }

  public withEnd(end: number): SampleWindowBuilder {
    return new SampleWindowBuilder({
      ...this.value,
      end,
    });
  }

  public build(): SampleWindowDto {
    return this.value;
  }
}

export class PlaybackSettingsBuilder implements IBuilder<PlaybackSettingsDto> {
  public constructor(
    private readonly value: PlaybackSettingsDto = {
      tempoBpm: 120,
      swing: 0,
    },
  ) {}

  public withTempoBpm(tempoBpm: number): PlaybackSettingsBuilder {
    return new PlaybackSettingsBuilder({
      ...this.value,
      tempoBpm,
    });
  }

  public withSwing(swing: number): PlaybackSettingsBuilder {
    return new PlaybackSettingsBuilder({
      ...this.value,
      swing,
    });
  }

  public build(): PlaybackSettingsDto {
    return this.value;
  }
}

export class SampleComponentBuilder implements IBuilder<SampleComponentDto> {
  public constructor(
    private readonly value: SampleComponentDto = {
      id: "sample-1",
      name: "Kick",
      source: "kick.wav",
      rootNote: 36,
    },
  ) {}

  public withId(id: string): SampleComponentBuilder {
    return new SampleComponentBuilder({
      ...this.value,
      id,
    });
  }

  public withName(name: string): SampleComponentBuilder {
    return new SampleComponentBuilder({
      ...this.value,
      name,
    });
  }

  public withSource(source: string): SampleComponentBuilder {
    return new SampleComponentBuilder({
      ...this.value,
      source,
    });
  }

  public withRootNote(rootNote: number): SampleComponentBuilder {
    return new SampleComponentBuilder({
      ...this.value,
      rootNote,
    });
  }

  public withoutSource(): SampleComponentBuilder {
    const { source: _removed, ...next } = this.value;
    return new SampleComponentBuilder(next);
  }

  public build(): SampleComponentDto {
    return this.value;
  }
}

export class ProjectComponentsBuilder implements IBuilder<ProjectComponentsDto> {
  public constructor(
    private readonly value: ProjectComponentsDto = {
      samples: [],
    },
  ) {}

  public withSamples(
    samples: readonly SampleComponentDto[],
  ): ProjectComponentsBuilder {
    return new ProjectComponentsBuilder({
      ...this.value,
      samples: [...samples],
    });
  }

  public withSample(
    sample: IBuilder<SampleComponentDto>,
  ): ProjectComponentsBuilder {
    return new ProjectComponentsBuilder({
      ...this.value,
      samples: [...this.value.samples, sample.build()],
    });
  }

  public build(): ProjectComponentsDto {
    return this.value;
  }
}

export class TrackDefaultsBuilder implements IBuilder<TrackDefaultsDto> {
  public constructor(
    private readonly value: TrackDefaultsDto = {},
  ) {}

  public withNote(note: number): TrackDefaultsBuilder {
    return new TrackDefaultsBuilder({
      ...this.value,
      note,
    });
  }

  public withChannel(channel: number): TrackDefaultsBuilder {
    return new TrackDefaultsBuilder({
      ...this.value,
      channel,
    });
  }

  public withVelocity(velocity: number): TrackDefaultsBuilder {
    return new TrackDefaultsBuilder({
      ...this.value,
      velocity,
    });
  }

  public withDurationTicks(durationTicks: number): TrackDefaultsBuilder {
    return new TrackDefaultsBuilder({
      ...this.value,
      durationTicks,
    });
  }

  public withProbability(probability: number): TrackDefaultsBuilder {
    return new TrackDefaultsBuilder({
      ...this.value,
      probability,
    });
  }

  public withOffsetTicks(offsetTicks: number): TrackDefaultsBuilder {
    return new TrackDefaultsBuilder({
      ...this.value,
      offsetTicks,
    });
  }

  public withPan(pan: number): TrackDefaultsBuilder {
    return new TrackDefaultsBuilder({
      ...this.value,
      pan,
    });
  }

  public withTuneSemitones(tuneSemitones: number): TrackDefaultsBuilder {
    return new TrackDefaultsBuilder({
      ...this.value,
      tuneSemitones,
    });
  }

  public withSampleWindow(
    sampleWindow: IBuilder<SampleWindowDto>,
  ): TrackDefaultsBuilder {
    return new TrackDefaultsBuilder({
      ...this.value,
      sampleWindow: sampleWindow.build(),
    });
  }

  public build(): TrackDefaultsDto {
    return this.value;
  }
}

export class StepBuilder implements IBuilder<StepDto> {
  public constructor(
    private readonly value: StepDto = {
      id: "step-1",
      step: 1,
      state: "active" as StepStateDto,
    },
  ) {}

  public withId(id: string): StepBuilder {
    return new StepBuilder({
      ...this.value,
      id,
    });
  }

  public withStep(step: number): StepBuilder {
    return new StepBuilder({
      ...this.value,
      step,
    });
  }

  public withState(state: StepStateDto): StepBuilder {
    return new StepBuilder({
      ...this.value,
      state,
    });
  }

  public withVelocity(velocity: number): StepBuilder {
    return new StepBuilder({
      ...this.value,
      velocity,
    });
  }

  public withDurationTicks(durationTicks: number): StepBuilder {
    return new StepBuilder({
      ...this.value,
      durationTicks,
    });
  }

  public withProbability(probability: number): StepBuilder {
    return new StepBuilder({
      ...this.value,
      probability,
    });
  }

  public withOffsetTicks(offsetTicks: number): StepBuilder {
    return new StepBuilder({
      ...this.value,
      offsetTicks,
    });
  }

  public withPan(pan: number): StepBuilder {
    return new StepBuilder({
      ...this.value,
      pan,
    });
  }

  public withTuneSemitones(tuneSemitones: number): StepBuilder {
    return new StepBuilder({
      ...this.value,
      tuneSemitones,
    });
  }

  public withSampleWindow(
    sampleWindow: IBuilder<SampleWindowDto>,
  ): StepBuilder {
    return new StepBuilder({
      ...this.value,
      sampleWindow: sampleWindow.build(),
    });
  }

  public withoutVelocity(): StepBuilder {
    const { velocity: _removed, ...next } = this.value;
    return new StepBuilder(next);
  }

  public build(): StepDto {
    return this.value;
  }
}

export class TrackBuilder implements IBuilder<TrackDto> {
  public constructor(
    private readonly value: TrackDto = {
      id: "track-1",
      name: "Kick Track",
      kind: "sample" as TrackKindDto,
      sampleId: "sample-1",
      defaults: {},
      muteState: "unmuted" as MuteStateDto,
      hits: [],
    },
  ) {}

  public withId(id: string): TrackBuilder {
    return new TrackBuilder({
      ...this.value,
      id,
    });
  }

  public withName(name: string): TrackBuilder {
    return new TrackBuilder({
      ...this.value,
      name,
    });
  }

  public withKind(kind: TrackKindDto): TrackBuilder {
    return new TrackBuilder({
      ...this.value,
      kind,
    });
  }

  public withSampleId(sampleId: string): TrackBuilder {
    return new TrackBuilder({
      ...this.value,
      sampleId,
    });
  }

  public withNote(note: number): TrackBuilder {
    return new TrackBuilder({
      ...this.value,
      note,
    });
  }

  public withChannel(channel: number): TrackBuilder {
    return new TrackBuilder({
      ...this.value,
      channel,
    });
  }

  public withDefaults(defaults: IBuilder<TrackDefaultsDto>): TrackBuilder {
    return new TrackBuilder({
      ...this.value,
      defaults: defaults.build(),
    });
  }

  public withMuteState(muteState: MuteStateDto): TrackBuilder {
    return new TrackBuilder({
      ...this.value,
      muteState,
    });
  }

  public withHits(hits: readonly StepDto[]): TrackBuilder {
    return new TrackBuilder({
      ...this.value,
      hits: [...hits],
    });
  }

  public withHit(hit: IBuilder<StepDto>): TrackBuilder {
    return new TrackBuilder({
      ...this.value,
      hits: [...this.value.hits, hit.build()],
    });
  }

  public withAdditionalProperty(name: string, value: unknown): TrackBuilder {
    return new TrackBuilder({
      ...(this.value as Record<string, unknown>),
      [name]: value,
    } as unknown as TrackDto);
  }

  public build(): TrackDto {
    return this.value;
  }
}

export class PatternBuilder implements IBuilder<PatternDto> {
  public constructor(
    private readonly value: PatternDto = {
      id: "pattern-1",
      name: "Main Pattern",
      stepCount: 16,
      ticksPerStep: 6,
      tracks: [],
    },
  ) {}

  public withId(id: string): PatternBuilder {
    return new PatternBuilder({
      ...this.value,
      id,
    });
  }

  public withName(name: string): PatternBuilder {
    return new PatternBuilder({
      ...this.value,
      name,
    });
  }

  public withStepCount(stepCount: number): PatternBuilder {
    return new PatternBuilder({
      ...this.value,
      stepCount,
    });
  }

  public withTicksPerStep(ticksPerStep: number): PatternBuilder {
    return new PatternBuilder({
      ...this.value,
      ticksPerStep,
    });
  }

  public withTracks(tracks: readonly TrackDto[]): PatternBuilder {
    return new PatternBuilder({
      ...this.value,
      tracks: [...tracks],
    });
  }

  public withTrack(track: IBuilder<TrackDto>): PatternBuilder {
    return new PatternBuilder({
      ...this.value,
      tracks: [...this.value.tracks, track.build()],
    });
  }

  public build(): PatternDto {
    return this.value;
  }
}

export class ProjectBuilder implements IBuilder<ProjectDto> {
  public constructor(
    private readonly value: ProjectDto = {
      schemaVersion: "1.0.0",
      projectId: "project-1",
      name: "Demo Project",
      activePatternId: "pattern-1",
      playback: {
        tempoBpm: 120,
        swing: 0,
      },
      components: {
        samples: [],
      },
      patterns: [],
    },
  ) {}

  public withSchemaVersion(schemaVersion: ProjectDto["schemaVersion"]): ProjectBuilder {
    return new ProjectBuilder({
      ...this.value,
      schemaVersion,
    });
  }

  public withProjectId(projectId: string): ProjectBuilder {
    return new ProjectBuilder({
      ...this.value,
      projectId,
    });
  }

  public withoutProjectId(): ProjectBuilder {
    const { projectId: _removed, ...next } =
      this.value as ProjectDto & { projectId?: string };

    return new ProjectBuilder(next as ProjectDto);
  }

  public withName(name: string): ProjectBuilder {
    return new ProjectBuilder({
      ...this.value,
      name,
    });
  }

  public withActivePatternId(activePatternId: string): ProjectBuilder {
    return new ProjectBuilder({
      ...this.value,
      activePatternId,
    });
  }

  public withPlayback(playback: IBuilder<PlaybackSettingsDto>): ProjectBuilder {
    return new ProjectBuilder({
      ...this.value,
      playback: playback.build(),
    });
  }

  public withComponents(
    componentsBuilder: IBuilder<ProjectComponentsDto>,
  ): ProjectBuilder {
    return new ProjectBuilder({
      ...this.value,
      components: componentsBuilder.build(),
    });
  }

  public withPattern(pattern: IBuilder<PatternDto>): ProjectBuilder {
    return new ProjectBuilder({
      ...this.value,
      patterns: [...this.value.patterns, pattern.build()],
    });
  }

  public withPatterns(patterns: readonly PatternDto[]): ProjectBuilder {
    return new ProjectBuilder({
      ...this.value,
      patterns: [...patterns],
    });
  }

  public withCreatedAt(createdAt: string): ProjectBuilder {
    return new ProjectBuilder({
      ...this.value,
      createdAt,
    });
  }

  public withUpdatedAt(updatedAt: string): ProjectBuilder {
    return new ProjectBuilder({
      ...this.value,
      updatedAt,
    });
  }

  public build(): ProjectDto {
    return this.value;
  }
}

export class SequencerProjectDocumentBuilder
  implements IBuilder<SequencerProjectDocumentDto>
{
  public constructor(
    private readonly value: SequencerProjectDocumentDto = {
      version: "1.0.0",
      project: new ProjectBuilder()
        .withComponents(
          new ProjectComponentsBuilder().withSample(
            new SampleComponentBuilder(),
          ),
        )
        .withPattern(
          new PatternBuilder().withTrack(
            new TrackBuilder()
              .withDefaults(
                new TrackDefaultsBuilder()
                  .withVelocity(100)
                  .withDurationTicks(6)
                  .withProbability(1)
                  .withOffsetTicks(0)
                  .withPan(0)
                  .withTuneSemitones(0)
                  .withSampleWindow(new SampleWindowBuilder()),
              )
              .withHit(
                new StepBuilder()
                  .withId("step-1")
                  .withStep(1)
                  .withState("active" as StepStateDto)
                  .withVelocity(110)
                  .withDurationTicks(6)
                  .withProbability(1)
                  .withOffsetTicks(0)
                  .withPan(0)
                  .withTuneSemitones(0)
                  .withSampleWindow(new SampleWindowBuilder()),
              ),
          ),
        )
        .build(),
    },
  ) {}

  public withVersion(
    version: SequencerProjectDocumentDto["version"],
  ): SequencerProjectDocumentBuilder {
    return new SequencerProjectDocumentBuilder({
      ...this.value,
      version,
    });
  }

  public withProject(project: IBuilder<ProjectDto>): SequencerProjectDocumentBuilder {
    return new SequencerProjectDocumentBuilder({
      ...this.value,
      project: project.build(),
    });
  }

  public build(): SequencerProjectDocumentDto {
    return this.value;
  }

  public buildJson(): string {
    return JSON.stringify(this.value);
  }
}
