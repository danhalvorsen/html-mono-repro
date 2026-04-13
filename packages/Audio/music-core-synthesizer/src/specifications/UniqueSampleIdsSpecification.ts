import { Specification } from "@monorepo/core-specifications";

import type { SequencerProjectDocumentDto } from "../dto.js";

export class UniqueSampleIdsSpecification
  extends Specification<SequencerProjectDocumentDto>
{
  public isSatisfiedBy(candidate: SequencerProjectDocumentDto): boolean {
    const sampleIds = candidate.project.components.samples.map((sample) => sample.id);
    return new Set(sampleIds).size === sampleIds.length;
  }
}
