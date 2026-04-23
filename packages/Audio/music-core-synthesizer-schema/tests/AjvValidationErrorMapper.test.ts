import { describe, expect, it } from "vitest";
import type { ErrorObject } from "ajv/dist/2020.js";

import { AjvValidationErrorMapper } from "../src/code.js";

describe("AjvValidationErrorMapper", () => {
  it("Given missing instance path and message When map Then fallback text is used", () => {
    const mapper = new AjvValidationErrorMapper();

    const result = mapper.map([
      {
        instancePath: "",
        schemaPath: "#/x",
        keyword: "required",
        params: {},
      } as ErrorObject,
    ]);

    expect(result).toEqual(["/ validation failed"]);
  });

  it("Given instance path and message When map Then those values are preserved", () => {
    const mapper = new AjvValidationErrorMapper();

    const result = mapper.map([
      {
        instancePath: "/project/id",
        schemaPath: "#/x",
        keyword: "minLength",
        params: {},
        message: "must NOT have fewer than 1 characters",
      } as ErrorObject,
    ]);

    expect(result).toEqual([
      "/project/id must NOT have fewer than 1 characters",
    ]);
  });
});
