import { Specification } from "@monorepo/core-specifications";

import type { SequencerProjectDocumentDto } from "../dto.js";

export class CreatedAtBeforeUpdatedAtSpecification
  extends Specification<SequencerProjectDocumentDto>
{
  public isSatisfiedBy(candidate: SequencerProjectDocumentDto): boolean {
    const { createdAt, updatedAt } = candidate.project;

    if (createdAt === undefined || updatedAt === undefined) {
      return true;
    }

    return Date.parse(createdAt) <= Date.parse(updatedAt);
  }
}
