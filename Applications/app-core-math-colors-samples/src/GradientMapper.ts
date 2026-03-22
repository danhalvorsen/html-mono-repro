// Applications/app-core-math-colors-samples/src/Gradient/GradientMapper.ts

import {
  NewGradient,
  NewGradientStop,
  type INewGradient,
  type IColor,
} from "@monorepo/core-math-colors";

import { ColorMapper } from "./ColorMapper.js";

export class GradientMapper {
  public static fromJson(json: any): INewGradient<IColor> {
    if (!json || !Array.isArray(json.stops)) {
      throw new Error("Invalid gradient JSON");
    }

    const name = typeof json.name === "string" ? json.name : "gradient";

    return NewGradient.create(
      json.stops.map((s: any) =>
        NewGradientStop.create(
          s.position,
          ColorMapper.fromJson(s.color),
        ),
      ),
      name,
    );
  }
}
