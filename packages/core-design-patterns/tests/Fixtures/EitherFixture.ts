// packages/core-design-patterns/tests/fixtures/EitherFixture.ts

import { Left, Right } from "../../src/functional/either/either.js";

export class EitherFixture {

  leftStringNumber() {
    return Left<string, number>("err");
  }

  rightNumberString() {
    return Right<number, string>(42);
  }

  leftMapped() {
    return this.leftStringNumber().mapLeft((x: string) => x.toUpperCase());
  }

  rightMapped() {
    return this.rightNumberString().mapRight((n: number) => `${n}!`);
  }

}