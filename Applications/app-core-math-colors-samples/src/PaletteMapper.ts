// Applications/app-core-math-colors-samples/src/Palette/PaletteMapper.ts

import {
  NewPalette,
  type INewPalette,
  type IColor,
} from "@monorepo/core-math-colors";

import { ColorMapper } from "./ColorMapper.js";

export class PaletteMapper {
  public fromJson(json: any): INewPalette<IColor> {
    if (!json || !Array.isArray(json.colors)) {
      throw new Error("Invalid palette JSON");
    }

    return NewPalette.create(
      json.colors.map((c: any) => ColorMapper.fromJson(c)),
    );
  }
}
