// ============================================================================
// FILE: tests/axis-style-tokens.test.ts
// ============================================================================

import { describe, expect, it } from "vitest";

import { APP_STYLE_TOKENS } from "../src/Style/app-style-tokens.js";
import { AxisStyleTokensFixture } from "./fixtures/AxisStyleTokensFixture.js";

describe("axis style tokens", () => {
  it("defines axis tokens as line extensions", () => {
    expect(APP_STYLE_TOKENS["axis-x"].extends).toEqual(["line"]);
    expect(APP_STYLE_TOKENS["axis-y"].extends).toEqual(["line"]);
  });

  it("resolves axis-x from line with axis-specific overrides", () => {
    const fixture = new AxisStyleTokensFixture();
    const style = fixture.resolveAxisX();

    expect(style.stroke?.color).toBe("#b91c1c");
    expect(style.stroke?.width).toBe(3.4);
    expect(style.stroke?.dash).toEqual([]);
    expect(style.fill?.color).toBe("transparent");
    expect(style.opacity).toBe(1);
  });

  it("resolves axis-y from line with axis-specific overrides", () => {
    const fixture = new AxisStyleTokensFixture();
    const style = fixture.resolveAxisY();

    expect(style.stroke?.color).toBe("#1d4ed8");
    expect(style.stroke?.width).toBe(3.4);
    expect(style.stroke?.dash).toEqual([]);
    expect(style.fill?.color).toBe("transparent");
    expect(style.opacity).toBe(1);
  });

  it("uses axis default token by axis name when no style is provided", () => {
    const fixture = new AxisStyleTokensFixture();
    const axisX = fixture.createAxisX();
    const axisY = fixture.createAxisY();

    expect(axisX.style.token).toBe("axis-x");
    expect(axisY.style.token).toBe("axis-y");
  });

  it("respects explicit style token override on axis shape", () => {
    const fixture = new AxisStyleTokensFixture();
    const axis = fixture.createAxisXWithToken("line-element");

    expect(axis.style.token).toBe("line-element");
  });

  it("applies axis line color to default vertex endpoint via policy", () => {
    const fixture = new AxisStyleTokensFixture();
    const endpointStyle = fixture.resolveAxisXEndpointStyle();

    expect(endpointStyle.stroke?.color).toBe("#b91c1c");
    expect(endpointStyle.fill?.color).toBe("#b91c1c");
  });
});