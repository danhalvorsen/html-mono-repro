import { afterEach, describe, expect, it } from "vitest";
import { Vector2 } from "@monorepo/core-math";

import "../../src/index.js";
import { MrVexCircleShape, MrVexPolygonShape } from "../../src/index.js";

describe("MrVexPolygonShape", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should resolve slotted vertices and translate them as one polygon", async () => {
    document.body.innerHTML = `
      <mr-vex-polygon-shape stroke="#60a5fa" stroke-width="2">
        <mr-vex-circle-shape center='{"x":100,"y":100}' radius="12"></mr-vex-circle-shape>
        <mr-vex-circle-shape center='{"x":220,"y":120}' radius="12"></mr-vex-circle-shape>
        <mr-vex-circle-shape center='{"x":160,"y":220}' radius="12"></mr-vex-circle-shape>
      </mr-vex-polygon-shape>
    `;

    await flush();

    const polygon = document.querySelector("mr-vex-polygon-shape");

    expect(polygon).toBeInstanceOf(MrVexPolygonShape);

    if (!(polygon instanceof MrVexPolygonShape)) {
      throw new Error("Expected polygon to be an instance of MrVexPolygonShape.");
    }

    expect(polygon.getVertices()).toHaveLength(3);
    expect(polygon.containsPoint(new Vector2(160, 150))).toBe(true);
    expect(polygon.getPosition()).toEqual(new Vector2(100, 100));
    expect(polygon.getWidth()).toBe(120);
    expect(polygon.getHeight()).toBe(120);

    polygon.setPosistion(new Vector2(130, 140));

    const vertices = polygon.getVertices();

    expect(vertices[0]?.getCenter()).toEqual(new Vector2(130, 140));
    expect(vertices[1]?.getCenter()).toEqual(new Vector2(250, 160));
    expect(vertices[2]?.getCenter()).toEqual(new Vector2(190, 260));
  });

  it("should keep non-draggable vertices discoverable for drawing but not draggable for hit testing", async () => {
    document.body.innerHTML = `
      <mr-vex-polygon-shape>
        <mr-vex-circle-shape center='{"x":80,"y":80}' radius="10"></mr-vex-circle-shape>
        <mr-vex-circle-shape center='{"x":160,"y":80}' radius="10"></mr-vex-circle-shape>
        <mr-vex-circle-shape center='{"x":120,"y":160}' radius="10"></mr-vex-circle-shape>
      </mr-vex-polygon-shape>
    `;

    await flush();

    const firstVertex = document.querySelector("mr-vex-circle-shape");

    expect(firstVertex).toBeInstanceOf(MrVexCircleShape);

    if (!(firstVertex instanceof MrVexCircleShape)) {
      throw new Error("Expected first vertex to be MrVexCircleShape.");
    }

    firstVertex.draggable = false;
    await firstVertex.updateComplete;

    expect(firstVertex.draggable).toBe(false);
    expect(firstVertex.containsPoint({ x: 80, y: 80 })).toBe(false);
  });
});

async function flush(): Promise<void> {
  await customElements.whenDefined("mr-vex-polygon-shape");
  await customElements.whenDefined("mr-vex-circle-shape");
  await Promise.resolve();
  await Promise.resolve();
}
