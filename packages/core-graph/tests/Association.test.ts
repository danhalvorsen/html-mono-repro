// packages/core-graph/tests/association.test.ts

import { describe, expect, it } from "vitest";
import { Association } from "../src/index.js";

describe("Association", () => {
  it("stores both items", () => {
    const association = new Association("A", 123);

    expect(association.item1).toBe("A");
    expect(association.item2).toBe(123);
  });
});