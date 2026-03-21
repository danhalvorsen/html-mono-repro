// Applications/app-core-math-colors-samples/src/Gradient/GradientMapper.ts

import {
  Color,
  Gradient,
  GradientStop,
  type IGradient,
} from "@monorepo/core-math-colors";

export class GradientMapper {
  public static fromJson(json: any): IGradient {
    if (!json || !Array.isArray(json.stops)) {
      throw new Error("Invalid gradient JSON");
    }

    return Gradient.create(
      json.stops.map((s: any) =>
        GradientStop.create(
          s.position,
          Color.fromNormalized(
            s.color.red,
            s.color.green,
            s.color.blue,
            s.color.alpha,
          ),
        ),
      ),
    );
  }
}