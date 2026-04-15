// packages/Audio/music-core-synthesizer/src/OpenApiSchemaProjectLoader.ts

import type { SequencerProjectDocumentDto } from "./dto.js";
import type { IProjectFactory } from "./IProjectFactory.js";
import type { IProjectLoader } from "./IProjectLoader.js";
import { OpenApiSchemaProjectLoaderCompositionRoot } from "./OpenApiSchemaProjectLoaderCompositionRoot.js";

export class OpenApiSchemaProjectLoader<TProject>
  implements IProjectLoader<TProject>
{
  private constructor(private readonly projectLoader: IProjectLoader<TProject>) {}

  public static create<TProject>(
    openApiYaml: string,
    projectFactory: IProjectFactory<SequencerProjectDocumentDto, TProject>,
  ): OpenApiSchemaProjectLoader<TProject> {
    const projectLoader = new OpenApiSchemaProjectLoaderCompositionRoot()
      .compose(openApiYaml, projectFactory);

    return new OpenApiSchemaProjectLoader(projectLoader);
  }

  public async load(input: string): Promise<TProject> {
    return await this.projectLoader.load(input);
  }
}
