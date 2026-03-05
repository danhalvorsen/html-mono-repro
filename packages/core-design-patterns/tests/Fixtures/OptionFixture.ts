// packages/core-design-patterns/tests/fixtures/OptionFixture.ts
import { None, Some } from "../../src/functional/option/option.js";

export class OptionFixture {
  public someString() {
    return Some("hello");
  }

  public someNumber() {
    return Some(42);
  }

  public noneString() {
    return None as ReturnType<typeof Some<string>>; // typed as Option<string>
  }

  public noneNumber() {
    return None as ReturnType<typeof Some<number>>; // typed as Option<number>
  }
}