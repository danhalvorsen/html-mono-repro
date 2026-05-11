import { describe, expect, it } from "vitest";
import { SvgAttributeEscaper, SvgLinePrimitiveAdapter } from "../src/index.js";
import { SvgTurtleRendererTestFixture } from "./fixtures/SvgTurtleRendererTestFixture.js";

describe("SVG escaping", () => {
  it("escapes SVG attribute values deterministically", () => {
    const escaper = new SvgAttributeEscaper();

    expect(escaper.escape('<tag attr="x">&value</tag>')).toBe(
      "&lt;tag attr=&quot;x&quot;&gt;&amp;value&lt;/tag&gt;",
    );
  });

  it("escapes primitive metadata used in SVG data attributes", () => {
    const fixture = new SvgTurtleRendererTestFixture();
    const adapter = new SvgLinePrimitiveAdapter();

    const primitive = {
      ...fixture.createLinePrimitive(),
      metadata: {
        id: '<unsafe "&">',
      },
    };

    const svg = adapter.render(primitive);

    expect(svg).toContain(
      'data-primitive-id="&lt;unsafe &quot;&amp;&quot;&gt;"',
    );
  });
});