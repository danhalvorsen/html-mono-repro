import type { ErrorObject } from "ajv/dist/2020.js";

import type { IValidationErrorMapper } from "./IValidationErrorMapper.js";

export class AjvValidationErrorMapper
  implements IValidationErrorMapper<ErrorObject>
{
  public map(errors: readonly ErrorObject[]): readonly string[] {
    return errors.map(
      (error) => `${error.instancePath || "/"} ${error.message ?? "validation failed"}`,
    );
  }
}
