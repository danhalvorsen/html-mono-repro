// packages/core-design-patterns/tests/fixtures/ResultFixture.ts
import { Err, Ok, type Result } from "../../src/index.js";

class ResultFixture {
  public okString(): Result<string, string> {
    return Ok<string, string>("success");
  }

  public okNumber(): Result<number, string> {
    return Ok<number, string>(42);
  }

  public errString(): Result<number, string> {
    return Err<number, string>("failure");
  }

  public errNumber(): Result<string, number> {
    return Err<string, number>(500);
  }
}

export function createResultFixture(): ResultFixture {
  return new ResultFixture();
}