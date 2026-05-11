import { describe, expect, it } from "vitest";
import { PopEmptyStackError } from "../src/index.js";
import { TurtleContractTestFixture } from "./fixtures/TurtleContractTestFixture.js";

describe("Turtle state stack", () => {
  it("pushState and popState restore renderer-neutral turtle state", () => {
    const fixture = new TurtleContractTestFixture();
    const turtle = fixture.createTurtle();

    turtle
      .forward(5)
      .pushState()
      .turnLeft(90)
      .penUp()
      .forward(20)
      .popState()
      .forward(5);

    const snapshot = turtle.snapshot();

    fixture.expectVectorClose(snapshot.position, { x: 10, y: 0, z: 0 });
    fixture.expectVectorClose(snapshot.forward, { x: 1, y: 0, z: 0 });
    fixture.expectVectorClose(snapshot.left, { x: 0, y: 1, z: 0 });
    fixture.expectVectorClose(snapshot.up, { x: 0, y: 0, z: 1 });
    expect(snapshot.isPenDown).toBe(true);

    const primitives = turtle.primitives();

    expect(primitives).toHaveLength(2);

    fixture.expectLinePrimitive(
      primitives[0]!,
      { x: 0, y: 0, z: 0 },
      { x: 5, y: 0, z: 0 },
    );

    fixture.expectLinePrimitive(
      primitives[1]!,
      { x: 5, y: 0, z: 0 },
      { x: 10, y: 0, z: 0 },
    );
  });

  it("does not remove already emitted branch primitives when state is popped", () => {
    const fixture = new TurtleContractTestFixture();
    const turtle = fixture.createTurtle();

    turtle
      .forward(5)
      .pushState()
      .turnLeft(90)
      .forward(5)
      .popState()
      .forward(5);

    expect(turtle.primitives()).toHaveLength(3);

    fixture.expectLinePrimitive(
      turtle.primitives()[1]!,
      { x: 5, y: 0, z: 0 },
      { x: 5, y: 5, z: 0 },
    );

    fixture.expectLinePrimitive(
      turtle.primitives()[2]!,
      { x: 5, y: 0, z: 0 },
      { x: 10, y: 0, z: 0 },
    );
  });

  it("throws PopEmptyStackError when popping an empty stack", () => {
    const fixture = new TurtleContractTestFixture();
    const turtle = fixture.createTurtle();

    expect(() => turtle.popState()).toThrow(PopEmptyStackError);
  });
});