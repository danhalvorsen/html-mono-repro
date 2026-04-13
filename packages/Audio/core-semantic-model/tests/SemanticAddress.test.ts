import { describe, expect, it } from "vitest";
import { createSemanticAddressFixture } from "./fixtures/semanticFixtures.js";

describe("SemanticAddress", () => {
  it("assigns constructor arguments to readonly properties", () => {
    const fixture = createSemanticAddressFixture();

    expect(fixture.address.domain).toBe(fixture.domain);
    expect(fixture.address.key).toBe(fixture.key);
  });

  it("keeps exact values, including empty strings", () => {
    const fixture = createSemanticAddressFixture({
      domain: "",
      key: "",
    });

    expect(fixture.address.domain).toBe("");
    expect(fixture.address.key).toBe("");
  });

  it("creates independent instances for different fixtures", () => {
    const left = createSemanticAddressFixture({ key: "left" });
    const right = createSemanticAddressFixture({ key: "right" });

    expect(left.address).not.toBe(right.address);
    expect(left.address.key).toBe("left");
    expect(right.address.key).toBe("right");
  });
});