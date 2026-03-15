import { afterEach, describe, expect, it } from "vitest";
import { Vector2 } from "@monorepo/core-math";

import "../../src/index.js";
import { MrVexArrowShape, VertexArrowShape } from "../../src/index.js";

describe("MrVexArrowShape", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should derive arrow geometry from slotted start and end vertices", async () => {
    document.body.innerHTML = `
      <mr-vex-arrow-shape stroke="#60a5fa" fill="#60a5fa" stroke-width="2">
        <mr-vex-circle-shape slot="start" center='{"x":100,"y":120}' radius="10"></mr-vex-circle-shape>
        <mr-vex-circle-shape slot="end" center='{"x":240,"y":120}' radius="10"></mr-vex-circle-shape>
      </mr-vex-arrow-shape>
    `;

    await flush();

    const arrow = document.querySelector("mr-vex-arrow-shape");

    expect(arrow).toBeInstanceOf(MrVexArrowShape);
    expect(VertexArrowShape).toBe(MrVexArrowShape);

    if (!(arrow instanceof MrVexArrowShape)) {
      throw new Error("Expected mr-vex-arrow-shape instance.");
    }

    expect(arrow.getPosition()).toEqual(new Vector2(100, 120));
    expect(arrow.getWidth()).toBe(140);
    expect(arrow.containsPoint(new Vector2(180, 120))).toBe(true);
    expect(arrow.containsPoint(new Vector2(233, 118))).toBe(true);
    expect(arrow.containsPoint(new Vector2(40, 40))).toBe(false);
  });
});

async function flush(): Promise<void> {
  await customElements.whenDefined("mr-vex-arrow-shape");
  await customElements.whenDefined("mr-vex-circle-shape");
  await Promise.resolve();
  await Promise.resolve();
}
