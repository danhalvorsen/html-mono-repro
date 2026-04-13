import type { ErrorObject } from "ajv/dist/2020.js";

import type { ISchemaValidator } from "./ISchemaValidator.js";
import type { IValidationErrorMapper } from "./IValidationErrorMapper.js";
import { SchemaValidationError } from "./SchemaValidationError.js";

export interface IValidateFunction<TDocument> {
  (input: unknown): input is TDocument;
  readonly errors?: readonly ErrorObject[] | null;
}

export class AjvSchemaValidator<TDocument> implements ISchemaValidator<TDocument> {
  public constructor(
    private readonly validateFn: IValidateFunction<TDocument>,
    private readonly errorMapper: IValidationErrorMapper<ErrorObject>,
  ) {}

  public validate(input: unknown): TDocument {
    if (!this.validateFn(input)) {
      throw new SchemaValidationError(
        "Project JSON failed schema validation.",
        this.errorMapper.map(this.validateFn.errors ?? []),
      );
    }

    return input;
  }
}
