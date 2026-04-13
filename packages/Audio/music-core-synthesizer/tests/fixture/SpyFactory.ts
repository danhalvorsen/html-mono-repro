import type { SequencerProjectDocumentDto } from "../../src/dto.js";
import type { IProjectFactory } from "../../src/IProjectFactory.js";

export class SpyFactory
  implements
    IProjectFactory<SequencerProjectDocumentDto, SequencerProjectDocumentDto>
{
  public received: SequencerProjectDocumentDto | null = null;

  public create(
    document: SequencerProjectDocumentDto,
  ): SequencerProjectDocumentDto {
    this.received = document;
    return document;
  }
}
