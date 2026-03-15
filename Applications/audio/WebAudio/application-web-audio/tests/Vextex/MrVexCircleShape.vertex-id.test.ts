import { afterEach, describe, expect, it } from "vitest";

import "../../src/index.js";
import { MrVexCircleShape } from "../../src/index.js";

describe("MrVexCircleShape vertex-id", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should mirror the vertex-id attribute into the underlying VexVertex id", async () => {
    document.body.innerHTML = `
      <mr-vex-circle-shape
        vertex-id="A"
        center='{"x":120,"y":160}'
        radius="12">
      </mr-vex-circle-shape>
    `;

    await flush();

    const vertex = document.querySelector("mr-vex-circle-shape");

    expect(vertex).toBeInstanceOf(MrVexCircleShape);

    if (!(vertex instanceof MrVexCircleShape)) {
      throw new Error("Expected mr-vex-circle-shape instance.");
    }

    expect(vertex.vertexId).toBe("A");
    expect(vertex.getVertex().getId()).toBe("A");
  });
});

async function flush(): Promise<void> {
  await customElements.whenDefined("mr-vex-circle-shape");
  await Promise.resolve();
  await Promise.resolve();
}
