import { afterEach, describe, expect, it } from "vitest";
import { Vector2 } from "@monorepo/core-math";

import "../../src/index.js";
import { MrVexCircleShape, MrVexMultiLineShape } from "../../src/index.js";

describe("MrVexMultiLineShape", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should translate an open shared-vertex line chain as one shape", async () => {
    document.body.innerHTML = `
      <mr-vex-multi-line-shape stroke="#60a5fa" stroke-width="2">
        <mr-vex-circle-shape center='{"x":100,"y":100}' radius="12"></mr-vex-circle-shape>
        <mr-vex-circle-shape center='{"x":220,"y":120}' radius="12"></mr-vex-circle-shape>
        <mr-vex-circle-shape center='{"x":160,"y":220}' radius="12"></mr-vex-circle-shape>
      </mr-vex-multi-line-shape>
    `;

    await flush();

    const multiline = document.querySelector("mr-vex-multi-line-shape");

    expect(multiline).toBeInstanceOf(MrVexMultiLineShape);

    if (!(multiline instanceof MrVexMultiLineShape)) {
      throw new Error("Expected mr-vex-multi-line-shape instance.");
    }

    expect(multiline.getVertices()).toHaveLength(3);
    expect(multiline.containsPoint(new Vector2(160, 110))).toBe(true);
    expect(multiline.containsPoint(new Vector2(120, 160))).toBe(false);
    expect(multiline.getPosition()).toEqual(new Vector2(100, 100));
    expect(multiline.getWidth()).toBe(120);
    expect(multiline.getHeight()).toBe(120);

    multiline.setPosistion(new Vector2(130, 140));

    const vertices = multiline.getVertices();

    expect(vertices[0]?.getCenter()).toEqual(new Vector2(130, 140));
    expect(vertices[1]?.getCenter()).toEqual(new Vector2(250, 160));
    expect(vertices[2]?.getCenter()).toEqual(new Vector2(190, 260));
  });

  it("should keep non-draggable shared vertices visible but out of direct drag hit testing", async () => {
    document.body.innerHTML = `
      <mr-vex-multi-line-shape>
        <mr-vex-circle-shape center='{"x":80,"y":80}' radius="10" draggable="false"></mr-vex-circle-shape>
        <mr-vex-circle-shape center='{"x":160,"y":80}' radius="10"></mr-vex-circle-shape>
        <mr-vex-circle-shape center='{"x":120,"y":160}' radius="10"></mr-vex-circle-shape>
      </mr-vex-multi-line-shape>
    `;

    await flush();

    const firstVertex = document.querySelector("mr-vex-circle-shape");

    expect(firstVertex).toBeInstanceOf(MrVexCircleShape);

    if (!(firstVertex instanceof MrVexCircleShape)) {
      throw new Error("Expected first vertex to be MrVexCircleShape.");
    }

    expect(firstVertex.draggable).toBe(false);
    expect(firstVertex.containsPoint({ x: 80, y: 80 })).toBe(false);
  });
});

async function flush(): Promise<void> {
  await customElements.whenDefined("mr-vex-multi-line-shape");
  await customElements.whenDefined("mr-vex-circle-shape");
  await Promise.resolve();
  await Promise.resolve();
}
