// packages/Audio/music-core-synthesizer/tests/OpenApiSchemaProjectLoader.schema-coverage.test.ts

import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  OpenApiSchemaProjectLoader,
  SchemaValidationError,
} from "../src/index.js";
import { SpyFactory } from "../../music-core-synthesizer/tests/fixture/SpyFactory.js";
import {
  PatternBuilder,
  PlaybackSettingsBuilder,
  ProjectBuilder,
  ProjectComponentsBuilder,
  SampleComponentBuilder,
  SampleWindowBuilder,
  SequencerProjectDocumentBuilder,
  StepBuilder,
  TrackBuilder,
  TrackDefaultsBuilder,
} from "../../music-core-synthesizer/tests/fixture/SequencerProjectDocumentBuilder.js";

async function readSchema(): Promise<string> {
  return readFile(
    path.resolve(import.meta.dirname, "../../music-core-synthesizer/src/state.yml"),
    "utf8",
  );
}

async function createLoader() {
  const schemaYaml = await readSchema();
  const factory = new SpyFactory();
  const loader = OpenApiSchemaProjectLoader.create(schemaYaml, factory);

  return { loader, factory };
}

async function expectValid(json: string): Promise<void> {
  const { loader, factory } = await createLoader();

  const result = await loader.load(json);

  expect(factory.received).not.toBeNull();
  expect(result).toBe(factory.received);
}

async function expectInvalid(json: string): Promise<void> {
  const { loader, factory } = await createLoader();

  await expect(loader.load(json)).rejects.toBeInstanceOf(SchemaValidationError);
  expect(factory.received).toBeNull();
}

function createValidDocumentJson(): string {
  return new SequencerProjectDocumentBuilder().buildJson();
}

describe("OpenApiSchemaProjectLoader schema coverage", () => {
  it("Given fully valid document When load Then validation succeeds", async () => {
    await expectValid(createValidDocumentJson());
  });

  it("Given version missing When load Then validation fails", async () => {
    const json = JSON.stringify({
      project: new ProjectBuilder().build(),
    });

    await expectInvalid(json);
  });

  it("Given project missing When load Then validation fails", async () => {
    const json = JSON.stringify({
      version: "1.0.0",
    });

    await expectInvalid(json);
  });

  it("Given schemaVersion invalid When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withSchemaVersion("2.0.0" as never),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given projectId missing When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(new ProjectBuilder().withoutProjectId())
      .buildJson();

    await expectInvalid(json);
  });

  it("Given project name empty When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(new ProjectBuilder().withName(""))
      .buildJson();

    await expectInvalid(json);
  });

  it("Given activePatternId empty When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(new ProjectBuilder().withActivePatternId(""))
      .buildJson();

    await expectInvalid(json);
  });

  it("Given tempo below minimum When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPlayback(
          new PlaybackSettingsBuilder().withTempoBpm(19),
        ),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given tempo above maximum When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPlayback(
          new PlaybackSettingsBuilder().withTempoBpm(301),
        ),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given swing below minimum When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPlayback(
          new PlaybackSettingsBuilder().withSwing(-0.01),
        ),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given swing above maximum When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPlayback(
          new PlaybackSettingsBuilder().withSwing(1.01),
        ),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given sample id empty When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withComponents(
          new ProjectComponentsBuilder().withSample(
            new SampleComponentBuilder().withId(""),
          ),
        ),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given sample name empty When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withComponents(
          new ProjectComponentsBuilder().withSample(
            new SampleComponentBuilder().withName(""),
          ),
        ),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given sample rootNote below minimum When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withComponents(
          new ProjectComponentsBuilder().withSample(
            new SampleComponentBuilder().withRootNote(-1),
          ),
        ),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given sample rootNote above maximum When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withComponents(
          new ProjectComponentsBuilder().withSample(
            new SampleComponentBuilder().withRootNote(128),
          ),
        ),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given stepCount using non power of two value When load Then validation succeeds", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder()
          .withComponents(
            new ProjectComponentsBuilder().withSample(
              new SampleComponentBuilder().withId("sample-1"),
            ),
          )
          .withPatterns([
            new PatternBuilder()
              .withStepCount(12)
              .withTracks([new TrackBuilder().build()])
              .build(),
          ]),
      )
      .buildJson();

    await expectValid(json);
  });

  it("Given stepCount below minimum When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder()
            .withStepCount(0)
            .withTracks([new TrackBuilder().build()])
            .build(),
        ]),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given stepCount above maximum When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder()
            .withStepCount(129)
            .withTracks([new TrackBuilder().build()])
            .build(),
        ]),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given ticksPerStep below minimum When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder()
            .withTicksPerStep(0)
            .withTracks([new TrackBuilder().build()])
            .build(),
        ]),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given patterns empty When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(new ProjectBuilder().withPatterns([]))
      .buildJson();

    await expectInvalid(json);
  });

  it("Given track defaults omitted When load Then validation fails", async () => {
    const invalidTrack = {
      id: "track-1",
      name: "Kick Track",
      kind: "sample",
      muteState: "unmuted",
      hits: [],
    };

    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder().withTracks([invalidTrack as never]).build(),
        ]),
      )
      .buildJson();

    await expectInvalid(json);
  });

it("Given tracks empty When load Then validation fails because tracks requires at least one item", async () => {
  const json = new SequencerProjectDocumentBuilder()
    .withProject(
      new ProjectBuilder().withPatterns([
        new PatternBuilder().withTracks([]).build(),
      ]),
    )
    .buildJson();

  await expectInvalid(json);
});
  it("Given track kind invalid When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder()
            .withTracks([
              new TrackBuilder().withKind("audio" as never).build(),
            ])
            .build(),
        ]),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given muteState invalid When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder()
            .withTracks([
              new TrackBuilder().withMuteState("off" as never).build(),
            ])
            .build(),
        ]),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given track name empty When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder()
            .withTracks([
              new TrackBuilder().withName("").build(),
            ])
            .build(),
        ]),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given channel below minimum When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder()
            .withTracks([
              new TrackBuilder().withChannel(0).build(),
            ])
            .build(),
        ]),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given channel above maximum When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder()
            .withTracks([
              new TrackBuilder().withChannel(17).build(),
            ])
            .build(),
        ]),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given note below minimum When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder()
            .withTracks([
              new TrackBuilder().withNote(-1).build(),
            ])
            .build(),
        ]),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given note above maximum When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder()
            .withTracks([
              new TrackBuilder().withNote(128).build(),
            ])
            .build(),
        ]),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given velocity below minimum on defaults When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder()
            .withTracks([
              new TrackBuilder().withDefaults(
                new TrackDefaultsBuilder().withVelocity(0),
              ).build(),
            ])
            .build(),
        ]),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given velocity above maximum on defaults When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder()
            .withTracks([
              new TrackBuilder().withDefaults(
                new TrackDefaultsBuilder().withVelocity(128),
              ).build(),
            ])
            .build(),
        ]),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given durationTicks below minimum on defaults When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder()
            .withTracks([
              new TrackBuilder().withDefaults(
                new TrackDefaultsBuilder().withDurationTicks(0),
              ).build(),
            ])
            .build(),
        ]),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given probability below minimum on defaults When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder()
            .withTracks([
              new TrackBuilder().withDefaults(
                new TrackDefaultsBuilder().withProbability(-0.1),
              ).build(),
            ])
            .build(),
        ]),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given probability above maximum on defaults When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder()
            .withTracks([
              new TrackBuilder().withDefaults(
                new TrackDefaultsBuilder().withProbability(1.1),
              ).build(),
            ])
            .build(),
        ]),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given pan below minimum on defaults When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder()
            .withTracks([
              new TrackBuilder().withDefaults(
                new TrackDefaultsBuilder().withPan(-1.1),
              ).build(),
            ])
            .build(),
        ]),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given pan above maximum on defaults When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder()
            .withTracks([
              new TrackBuilder().withDefaults(
                new TrackDefaultsBuilder().withPan(1.1),
              ).build(),
            ])
            .build(),
        ]),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given sampleWindow start below minimum on defaults When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder()
            .withTracks([
              new TrackBuilder().withDefaults(
                new TrackDefaultsBuilder().withSampleWindow(
                  new SampleWindowBuilder().withStart(-0.01),
                ),
              ).build(),
            ])
            .build(),
        ]),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given sampleWindow end above maximum on defaults When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder()
            .withTracks([
              new TrackBuilder().withDefaults(
                new TrackDefaultsBuilder().withSampleWindow(
                  new SampleWindowBuilder().withEnd(1.01),
                ),
              ).build(),
            ])
            .build(),
        ]),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given step state invalid When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder()
            .withTracks([
              new TrackBuilder().withHit(
                new StepBuilder().withState("enabled" as never),
              ).build(),
            ])
            .build(),
        ]),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given step index below minimum When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder()
            .withTracks([
              new TrackBuilder().withHit(
                new StepBuilder().withStep(0),
              ).build(),
            ])
            .build(),
        ]),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given step index above maximum When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder()
            .withTracks([
              new TrackBuilder().withHit(
                new StepBuilder().withStep(129),
              ).build(),
            ])
            .build(),
        ]),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given step velocity below minimum When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder()
            .withTracks([
              new TrackBuilder().withHit(
                new StepBuilder().withVelocity(0),
              ).build(),
            ])
            .build(),
        ]),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given step velocity above maximum When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder()
            .withTracks([
              new TrackBuilder().withHit(
                new StepBuilder().withVelocity(128),
              ).build(),
            ])
            .build(),
        ]),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given step durationTicks below minimum When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder()
            .withTracks([
              new TrackBuilder().withHit(
                new StepBuilder().withDurationTicks(0),
              ).build(),
            ])
            .build(),
        ]),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given step probability below minimum When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder()
            .withTracks([
              new TrackBuilder().withHit(
                new StepBuilder().withProbability(-0.1),
              ).build(),
            ])
            .build(),
        ]),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given step probability above maximum When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder()
            .withTracks([
              new TrackBuilder().withHit(
                new StepBuilder().withProbability(1.1),
              ).build(),
            ])
            .build(),
        ]),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given step pan below minimum When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder()
            .withTracks([
              new TrackBuilder().withHit(
                new StepBuilder().withPan(-1.1),
              ).build(),
            ])
            .build(),
        ]),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given step pan above maximum When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder()
            .withTracks([
              new TrackBuilder().withHit(
                new StepBuilder().withPan(1.1),
              ).build(),
            ])
            .build(),
        ]),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given step sampleWindow start below minimum When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder()
            .withTracks([
              new TrackBuilder().withHit(
                new StepBuilder().withSampleWindow(
                  new SampleWindowBuilder().withStart(-0.01),
                ),
              ).build(),
            ])
            .build(),
        ]),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given step sampleWindow end above maximum When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder()
            .withTracks([
              new TrackBuilder().withHit(
                new StepBuilder().withSampleWindow(
                  new SampleWindowBuilder().withEnd(1.01),
                ),
              ).build(),
            ])
            .build(),
        ]),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given createdAt invalid format When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withCreatedAt("not-a-date"),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given updatedAt invalid format When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withUpdatedAt("not-a-date"),
      )
      .buildJson();

    await expectInvalid(json);
  });

  it("Given additional property on track When load Then validation fails", async () => {
    const json = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withPatterns([
          new PatternBuilder()
            .withTracks([
              new TrackBuilder()
                .withAdditionalProperty("unexpectedProperty", true)
                .build(),
            ])
            .build(),
        ]),
      )
      .buildJson();

    await expectInvalid(json);
  });
});
