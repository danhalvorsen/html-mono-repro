// Applications/audio/WebAudio/application-web-audio/tests/Shape.test.ts

import { describe, expect, it } from "vitest";
import { customElement } from "lit/decorators.js";
import { Vector2 } from "@monorepo/core-math";

import type { ICanvasContext } from "../src/lit3/WebComponents/ICanvasContext.js";
import {
  Shape,
  type ShapeType,
} from "../src/lit3/WebComponents/Shapes/Shape/Shape.js";

@customElement("mr-test-shape")
class TestShape extends Shape {
  public pointInsideResult = false;

  public lastPointInsideArgs:
    | Readonly<{ point: Vector2; type: ShapeType }>
    | undefined;

  public drawCalls = 0;
  public lastDrawContext: ICanvasContext | undefined;

  public override pointInsideShape(point: Vector2, type: ShapeType): boolean {
    this.lastPointInsideArgs = { point, type };
    return this.pointInsideResult;
  }

  public override draw(context: ICanvasContext): void {
    this.drawCalls++;
    this.lastDrawContext = context;
  }
}

function createShape(): TestShape {
  return document.createElement("mr-test-shape") as TestShape;
}

describe("Shape", () => {
  it("should return id from getId", () => {
    const sut = createShape();

    sut.id = "shape-1";

    expect(sut.getId()).toBe("shape-1");
  });

  it("should return center from getCenter", () => {
    const sut = createShape();
    const center = new Vector2(10, 20);

    sut.setCenter(center);

    expect(sut.getCenter()).toEqual(center);
  });

  it("should set center from setCenter", () => {
    const sut = createShape();

    sut.setCenter(new Vector2(25, 35));

    expect(sut.getCenter()).toEqual(new Vector2(25, 35));
  });

  it("should return position from center width and height", () => {
    const sut = createShape();

    sut.setCenter(new Vector2(50, 40));
    sut.setSize(20, 10);

    expect(sut.getPosition()).toEqual(new Vector2(40, 35));
  });

  it("should update center when setPosistion is called", () => {
    const sut = createShape();

    sut.setSize(20, 10);
    sut.setPosistion(new Vector2(40, 35));

    expect(sut.getCenter()).toEqual(new Vector2(50, 40));
  });

  it("should return width from getWidth", () => {
    const sut = createShape();

    sut.setWidth(123);

    expect(sut.getWidth()).toBe(123);
  });

  it("should clamp width to zero when setWidth gets negative value", () => {
    const sut = createShape();

    sut.setWidth(-1);

    expect(sut.getWidth()).toBe(0);
  });

  it("should return height from getHeight", () => {
    const sut = createShape();

    sut.setHeight(321);

    expect(sut.getHeight()).toBe(321);
  });

  it("should clamp height to zero when setHeight gets negative value", () => {
    const sut = createShape();

    sut.setHeight(-1);

    expect(sut.getHeight()).toBe(0);
  });

  it("should set both width and height when setSize is called", () => {
    const sut = createShape();

    sut.setSize(80, 60);

    expect(sut.getWidth()).toBe(80);
    expect(sut.getHeight()).toBe(60);
  });

  it("should clamp negative values to zero when setSize is called", () => {
    const sut = createShape();

    sut.setSize(-80, -60);

    expect(sut.getWidth()).toBe(0);
    expect(sut.getHeight()).toBe(0);
  });

  it("should call pointInsideShape on the concrete implementation", () => {
    const sut = createShape();
    const point = new Vector2(11, 22);

    sut.pointInsideResult = true;

    const actual = sut.pointInsideShape(point, "rectangle");

    expect(actual).toBe(true);
    expect(sut.lastPointInsideArgs).toEqual({
      point,
      type: "rectangle",
    });
  });

it("should call draw on concrete implementation", () => {
  const sut = createShape();

  const context = {
    canvas: {} as HTMLCanvasElement,
    ctx: {} as CanvasRenderingContext2D,
  };

  sut.draw(context);

  expect(sut.drawCalls).toBe(1);
  expect(sut.lastDrawContext).toBe(context);
});
});