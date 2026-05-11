import { describe, expect, it } from "vitest";
import { PrimitiveKind } from "../src/index.js";
import { TurtleContractTestFixture } from "./fixtures/TurtleContractTestFixture.js";

describe("Turtle commands", () => {
  it("moves forward along +X and emits a line when the pen is down", () => {
    const fixture = new TurtleContractTestFixture();
    const turtle = fixture.createTurtle();

    const result = turtle.forward(10);

    expect(result).toBe(turtle);

    const snapshot = turtle.snapshot();
    fixture.expectVectorClose(snapshot.position, { x: 10, y: 0, z: 0 });

    const primitives = turtle.primitives();

    expect(primitives).toHaveLength(1);
    expect(primitives[0]?.kind).toBe(PrimitiveKind.Line);

    fixture.expectLinePrimitive(
      primitives[0]!,
      { x: 0, y: 0, z: 0 },
      { x: 10, y: 0, z: 0 },
    );
  });

  it("uses move(distance) as an alias for forward(distance)", () => {
    const fixture = new TurtleContractTestFixture();
    const turtle = fixture.createTurtle();

    turtle.move(5);

    fixture.expectVectorClose(turtle.snapshot().position, { x: 5, y: 0, z: 0 });

    const primitives = turtle.primitives();

    expect(primitives).toHaveLength(1);
    fixture.expectLinePrimitive(
      primitives[0]!,
      { x: 0, y: 0, z: 0 },
      { x: 5, y: 0, z: 0 },
    );
  });

  it("does not emit primitives while the pen is up", () => {
    const fixture = new TurtleContractTestFixture();
    const turtle = fixture.createTurtle();

    turtle.penUp().forward(10);

    const snapshot = turtle.snapshot();

    expect(snapshot.isPenDown).toBe(false);
    fixture.expectVectorClose(snapshot.position, { x: 10, y: 0, z: 0 });
    expect(turtle.primitives()).toHaveLength(0);
  });

  it("resumes primitive emission after penDown()", () => {
    const fixture = new TurtleContractTestFixture();
    const turtle = fixture.createTurtle();

    turtle.penUp().forward(10).penDown().forward(5);

    expect(turtle.primitives()).toHaveLength(1);
    fixture.expectLinePrimitive(
      turtle.primitives()[0]!,
      { x: 10, y: 0, z: 0 },
      { x: 15, y: 0, z: 0 },
    );
  });

  it("turnLeft rotates heading counterclockwise around +Z in the XY plane", () => {
    const fixture = new TurtleContractTestFixture();
    const turtle = fixture.createTurtle();

    turtle.turnLeft(90).forward(10);

    const snapshot = turtle.snapshot();

    fixture.expectVectorClose(snapshot.forward, { x: 0, y: 1, z: 0 });
    fixture.expectVectorClose(snapshot.left, { x: -1, y: 0, z: 0 });
    fixture.expectVectorClose(snapshot.up, { x: 0, y: 0, z: 1 });
    fixture.expectVectorClose(snapshot.position, { x: 0, y: 10, z: 0 });

    fixture.expectLinePrimitive(
      turtle.primitives()[0]!,
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 10, z: 0 },
    );
  });

  it("turnRight rotates heading clockwise around +Z in the XY plane", () => {
    const fixture = new TurtleContractTestFixture();
    const turtle = fixture.createTurtle();

    turtle.turnRight(90).forward(10);

    const snapshot = turtle.snapshot();

    fixture.expectVectorClose(snapshot.forward, { x: 0, y: -1, z: 0 });
    fixture.expectVectorClose(snapshot.left, { x: 1, y: 0, z: 0 });
    fixture.expectVectorClose(snapshot.up, { x: 0, y: 0, z: 1 });
    fixture.expectVectorClose(snapshot.position, { x: 0, y: -10, z: 0 });
  });

  it("clear removes emitted primitives without changing turtle orientation", () => {
    const fixture = new TurtleContractTestFixture();
    const turtle = fixture.createTurtle();

    turtle.turnLeft(90).forward(10).clear();

    expect(turtle.primitives()).toHaveLength(0);

    const snapshot = turtle.snapshot();

    fixture.expectVectorClose(snapshot.position, { x: 0, y: 10, z: 0 });
    fixture.expectVectorClose(snapshot.forward, { x: 0, y: 1, z: 0 });
    fixture.expectVectorClose(snapshot.left, { x: -1, y: 0, z: 0 });
    fixture.expectVectorClose(snapshot.up, { x: 0, y: 0, z: 1 });
  });

  it("reset restores default state and clears emitted primitives", () => {
    const fixture = new TurtleContractTestFixture();
    const turtle = fixture.createTurtle();

    turtle.turnLeft(90).forward(10).penUp().reset();

    fixture.expectDefault3DState(turtle.snapshot());
    expect(turtle.primitives()).toHaveLength(0);
  });
});