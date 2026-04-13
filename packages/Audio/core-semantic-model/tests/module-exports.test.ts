import { describe, expect, it } from "vitest";
import {
  createSemanticAddressFixture,
  getSourceModuleSpecifiers,
} from "./fixtures/semanticFixtures.js";
import { SemanticAddress } from "../src/index.js";

describe("core-semantic-model module exports", () => {
  it("exports SemanticAddress from the package entrypoint", () => {
    const fixture = createSemanticAddressFixture({
      domain: "module",
      key: "entrypoint",
    });

    const fromIndex = new SemanticAddress(fixture.domain, fixture.key);

    expect(SemanticAddress).toBeTypeOf("function");
    expect(fromIndex.domain).toBe("module");
    expect(fromIndex.key).toBe("entrypoint");
  });

  it("loads every source module without runtime errors", async () => {
    const moduleSpecifiers = getSourceModuleSpecifiers();

    const loaded = await Promise.all(
      moduleSpecifiers.map(async (specifier) => {
        const mod = await import(specifier);
        return { specifier, mod };
      })
    );

    expect(loaded).toHaveLength(moduleSpecifiers.length);
    expect(
      loaded.every(({ mod }) => mod !== null && typeof mod === "object")
    ).toBe(true);
  });
});