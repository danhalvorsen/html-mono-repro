import type { IJsonDocumentParser, ISchemaValidator } from "./code.js";
import type { IProjectFactory } from "./IProjectFactory.js";
import type { IProjectLoader } from "./IProjectLoader.js";
import type { ISemanticValidator } from "./ISemanticValidator.js";

export class ProjectLoader<TDocument, TProject, TInput = string>
  implements IProjectLoader<TProject, TInput>
{
  public constructor(
    private readonly documentParser: IJsonDocumentParser<TInput>,
    private readonly schemaValidator: ISchemaValidator<TDocument>,
    private readonly semanticValidator: ISemanticValidator<TDocument>,
    private readonly projectFactory: IProjectFactory<TDocument, TProject>,
  ) {}

  public load(input: TInput): TProject {
    const parsed = this.documentParser.parse(input);
    const schemaValidatedDocument = this.schemaValidator.validate(parsed);
    const semanticallyValidatedDocument = this.semanticValidator.validate(
      schemaValidatedDocument,
    );
    return this.projectFactory.create(semanticallyValidatedDocument);
  }
}
