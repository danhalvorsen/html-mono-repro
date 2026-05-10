import type { GameObjectColorTheme, IColorManagedGameObject } from "../ColorManagement/IColorManagedGameObject.js";
import type { VectorFieldGameObjectOptions } from "./VectorFieldGameObjectOptions.js";

export interface IVectorFieldColorThemeTarget extends IColorManagedGameObject {
  vectorFieldOptions: VectorFieldGameObjectOptions;
}

export class VectorFieldGameObjectColorThemeAdapter {
  public apply(target: IVectorFieldColorThemeTarget, theme: GameObjectColorTheme): void {
    const palette = theme.paletteCss;
    const foreground = palette[palette.length - 1] ?? theme.foregroundCss;
    const shadow = palette[0] ?? theme.shadowCss;

    target.vectorFieldOptions = {
      ...target.vectorFieldOptions,
      stroke: {
        ...target.vectorFieldOptions.stroke,
        background: theme.backgroundCss,
        foreground,
        shadow,
        foregroundOpacity: theme.opacity,
        shadowOpacity: Math.max(0, theme.opacity - 0.1),
      },
    };
  }
}