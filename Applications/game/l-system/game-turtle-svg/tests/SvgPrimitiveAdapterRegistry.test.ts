import { describe, expect, it } from "vitest";
import {
  DefaultSvgPrimitiveAdapterRegistry,
  MissingAdapterError,
  SvgLinePrimitiveAdapter,
} from "../src/index.js";
import { SvgTurtleRendererTestFixture } from "./fixtures/SvgTurtleRendererTestFixture.js";

describe("DefaultSvgPrimitiveAdapterRegistry", () => {
  it("resolves an explicitly registered adapter by primitive kind", () => {
    const fixture = new SvgTurtleRendererTestFixture();
    const registry = new DefaultSvgPrimitiveAdapterRegistry([
      new SvgLinePrimitiveAdapter(),
    ]);

    const adapter = registry.resolve(fixture.createLinePrimitive());

    expect(adapter).toBeInstanceOf(SvgLinePrimitiveAdapter);
  });

  it("throws MissingAdapterError when no adapter can render the primitive", () => {
    const fixture = new SvgTurtleRendererTestFixture();
    const registry = new DefaultSvgPrimitiveAdapterRegistry([]);

    expect(() => registry.resolve(fixture.createLinePrimitive())).toThrow(
      MissingAdapterError,
    );
  });

  it("uses explicit registration order deterministically", () => {
    const fixture = new SvgTurtleRendererTestFixture();
    const first = new SvgLinePrimitiveAdapter();
    const second = new SvgLinePrimitiveAdapter();

    const registry = new DefaultSvgPrimitiveAdapterRegistry([first, second]);

    expect(registry.resolve(fixture.createLinePrimitive())).toBe(first);
  });
});