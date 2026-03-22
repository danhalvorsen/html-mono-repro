// ============================================================================
// FILE: tests/fixtures/AxisStyleTokensFixture.ts
// ============================================================================

import { StyleLibrary, StyleResolver } from "@monorepo/core-style-system";

import { APP_STYLE_TOKENS } from "../../src/Style/app-style-tokens.js";
import { AxisShape } from "../../src/Shapes/CoordinateSystem/Axis/AxisShape.js";
import { LineShape } from "../../src/Shapes/Line/LineShape.js";
import { ShapeStylePolicy } from "../../src/rendering/ShapeStylePolicy.js";

export class AxisStyleTokensFixture {
  private static readonly X_AXIS_START = { x: -1, y: 0 } as const;
  private static readonly X_AXIS_END = { x: 1, y: 0 } as const;
  private static readonly Y_AXIS_START = { x: 0, y: -1 } as const;
  private static readonly Y_AXIS_END = { x: 0, y: 1 } as const;

  public readonly resolver: StyleResolver;
  public readonly policy: ShapeStylePolicy;

  public constructor() {
    this.resolver = new StyleResolver([new StyleLibrary(APP_STYLE_TOKENS)]);
    this.policy = new ShapeStylePolicy();
  }

  public createAxisX(): AxisShape {
    return new AxisShape(
      "x",
      this.createXAxisLine(),
    );
  }

  public createAxisY(): AxisShape {
    return new AxisShape(
      "y",
      this.createYAxisLine(),
    );
  }

  public createAxisXWithToken(token: string): AxisShape {
    return new AxisShape(
      "x",
      this.createXAxisLine(),
      { token },
    );
  }

  public resolveAxisX() {
    return this.resolver.resolve({ token: "axis-x" });
  }

  public resolveAxisY() {
    return this.resolver.resolve({ token: "axis-y" });
  }

  public resolveAxisXEndpointStyle() {
    const resolvedAxisX = this.resolveAxisX();
    const endpointReference = this.policy.lineEndpointReference(
      { token: "vertex" },
      resolvedAxisX,
    );

    return this.resolver.resolve(endpointReference);
  }

  private createXAxisLine(): LineShape {
    return new LineShape(
      AxisStyleTokensFixture.X_AXIS_START,
      AxisStyleTokensFixture.X_AXIS_END,
    );
  }

  private createYAxisLine(): LineShape {
    return new LineShape(
      AxisStyleTokensFixture.Y_AXIS_START,
      AxisStyleTokensFixture.Y_AXIS_END,
    );
  }
}
