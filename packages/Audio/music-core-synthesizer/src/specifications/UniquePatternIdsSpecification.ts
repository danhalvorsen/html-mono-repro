import { Specification } from "@monorepo/core-specifications";

import type { SequencerProjectDocumentDto } from "../dto.js";

export class UniquePatternIdsSpecification
  extends Specification<SequencerProjectDocumentDto>
{
  public isSatisfiedBy(candidate: SequencerProjectDocumentDto): boolean {
    const patternIds = candidate.project.patterns.map((pattern) => pattern.id);
    return new Set(patternIds).size === patternIds.length;
  }
}
