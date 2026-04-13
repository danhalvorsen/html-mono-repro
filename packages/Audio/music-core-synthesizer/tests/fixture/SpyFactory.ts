import type { components } from "../../src/generated/schema-types.js";
import type { IProjectFactory } from "../../src/IProjectFactory.js";

type SequencerProjectDocumentDto =
  components["schemas"]["SequencerProjectDocument"];

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
