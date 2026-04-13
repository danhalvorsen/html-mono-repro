import { Specification } from "@monorepo/core-specifications";

import type { SequencerProjectDocumentDto } from "../dto.js";

export class ReferencedSamplesExistSpecification
  extends Specification<SequencerProjectDocumentDto>
{
  public isSatisfiedBy(candidate: SequencerProjectDocumentDto): boolean {
    const sampleIds = new Set(
      candidate.project.components.samples.map((sample) => sample.id),
    );

    return candidate.project.patterns.every((pattern) =>
      pattern.tracks.every((track) =>
        track.sampleId === undefined || sampleIds.has(track.sampleId),
      ),
    );
  }
}
