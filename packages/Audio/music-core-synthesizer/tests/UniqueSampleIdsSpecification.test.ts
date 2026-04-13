import { describe, expect, it } from "vitest";

import { UniqueSampleIdsSpecification } from "../src/specifications/UniqueSampleIdsSpecification.js";
import {
  ProjectBuilder,
  ProjectComponentsBuilder,
  SampleComponentBuilder,
  SequencerProjectDocumentBuilder,
} from "./fixture/SequencerProjectDocumentBuilder.js";

describe("UniqueSampleIdsSpecification", () => {
  it("Given unique sample ids When isSatisfiedBy Then it returns true", () => {
    const sut = new UniqueSampleIdsSpecification();
    const candidate = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withComponents(
          new ProjectComponentsBuilder().withSamples([
            new SampleComponentBuilder().withId("sample-1").build(),
            new SampleComponentBuilder().withId("sample-2").build(),
          ]),
        ),
      )
      .build();

    expect(sut.isSatisfiedBy(candidate)).toBe(true);
  });

  it("Given duplicate sample ids When isSatisfiedBy Then it returns false", () => {
    const sut = new UniqueSampleIdsSpecification();
    const candidate = new SequencerProjectDocumentBuilder()
      .withProject(
        new ProjectBuilder().withComponents(
          new ProjectComponentsBuilder().withSamples([
            new SampleComponentBuilder().withId("sample-1").build(),
            new SampleComponentBuilder().withId("sample-1").build(),
          ]),
        ),
      )
      .build();

    expect(sut.isSatisfiedBy(candidate)).toBe(false);
  });
});
