import { Specification } from "@monorepo/core-specifications";

import type { SequencerProjectDocumentDto } from "../dto.js";

export class SampleWindowStartBeforeEndSpecification
  extends Specification<SequencerProjectDocumentDto>
{
  public isSatisfiedBy(candidate: SequencerProjectDocumentDto): boolean {
    return candidate.project.patterns.every((pattern) =>
      pattern.tracks.every((track) =>
        this.isSampleWindowValid(track.defaults.sampleWindow)
        && track.hits.every((step) => this.isSampleWindowValid(step.sampleWindow)),
      ),
    );
  }

  private isSampleWindowValid(
    sampleWindow: SequencerProjectDocumentDto["project"]["patterns"][number]["tracks"][number]["defaults"]["sampleWindow"]
      | SequencerProjectDocumentDto["project"]["patterns"][number]["tracks"][number]["hits"][number]["sampleWindow"]
      | undefined,
  ): boolean {
    if (sampleWindow === undefined) {
      return true;
    }

    return sampleWindow.start <= sampleWindow.end;
  }
}
