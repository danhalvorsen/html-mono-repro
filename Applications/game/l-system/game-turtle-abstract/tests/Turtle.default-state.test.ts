import { describe, it } from "vitest";
import { TurtleContractTestFixture } from "./fixtures/TurtleContractTestFixture.js";

describe("DefaultTurtleFactory", () => {
  it("creates a right-handed 3D turtle with deterministic default state", () => {
    const fixture = new TurtleContractTestFixture();

    const turtle = fixture.createTurtle();

    fixture.expectDefault3DState(turtle.snapshot());
  });
});