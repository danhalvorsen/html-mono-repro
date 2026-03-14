// ====================================================================================
// FILE: tests/fixtures/createCircleShapeFixture.ts
// ====================================================================================

import { Vector2 } from "@monorepo/core-math";

import { CircleShape } from "../src/index.js";

export type CircleShapeFixture = {
  readonly sut: CircleShape;
  readonly context: {
    readonly canvas: HTMLCanvasElement;
    readonly ctx: CanvasRenderingContext2D;
  };
};

export function createCircleShapeFixture(): CircleShapeFixture {
  const sut = new CircleShape();
  const canvas = document.createElement("canvas");
  canvas.width = 300;
  canvas.height = 200;

  const ctx = canvas.getContext("2d");
  if (ctx === null) {
    throw new Error("Expected 2D canvas context.");
  }

  sut.center = new Vector2(30, 20);
  sut.radius = 6;
  sut.fill = "#ffffff";
  sut.stroke = "#1f2937";
  sut.strokeWidth = 1;

  return {
    sut,
    context: {
      canvas,
      ctx,
    },
  };
}