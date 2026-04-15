import { describe, expect, it } from "vitest";

import { AjvSchemaValidator } from "../src/AjvSchemaValidator.js";
import { SchemaValidationError } from "../src/SchemaValidationError.js";

describe("AjvSchemaValidator", () => {
  it("Given valid input When validate Then input is returned", () => {
    const validator = new AjvSchemaValidator<{ readonly ok: true }>(
      ((input: unknown): input is { readonly ok: true } =>
        input !== null && typeof input === "object" && "ok" in input) as never,
      { map: () => ["unused"] },
    );

    const result = validator.validate({ ok: true });

    expect(result).toEqual({ ok: true });
  });

  it("Given invalid input with null errors When validate Then SchemaValidationError is thrown with mapped empty errors", () => {
    const validator = new AjvSchemaValidator<never>(
      Object.assign(
        () => false,
        { errors: null },
      ) as never,
      { map: (errors) => [`count:${errors.length}`] },
    );

    expect(() => validator.validate("bad")).toThrowError(SchemaValidationError);
    expect(() => validator.validate("bad")).toThrowError("Project JSON failed schema validation.");

    try {
      validator.validate("bad");
    } catch (error) {
      expect(error).toBeInstanceOf(SchemaValidationError);
      expect((error as SchemaValidationError).validationErrors).toEqual(["count:0"]);
    }
  });
});
