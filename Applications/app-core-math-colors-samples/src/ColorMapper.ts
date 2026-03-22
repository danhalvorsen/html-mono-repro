// Applications/app-core-math-colors-samples/src/Common/ColorMapper.ts

import { Color } from "@monorepo/core-math-colors";

export class ColorMapper {
  public static fromJson(json: any): Color {
    if (!json) {
      throw new Error("Invalid color JSON");
    }

    return Color.fromNormalized(
      json.red,
      json.green,
      json.blue,
      json.alpha ?? 1,
    );
  }
}