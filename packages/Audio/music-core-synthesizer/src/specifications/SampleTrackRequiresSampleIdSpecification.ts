import { Specification } from "@monorepo/core-specifications";

import type { SequencerProjectDocumentDto } from "../dto.js";

export class SampleTrackRequiresSampleIdSpecification
  extends Specification<SequencerProjectDocumentDto>
{
  public isSatisfiedBy(candidate: SequencerProjectDocumentDto): boolean {
    return candidate.project.patterns.every((pattern) =>
      pattern.tracks.every((track) =>
        track.kind !== "sample" || track.sampleId !== undefined,
      ),
    );
  }
}
