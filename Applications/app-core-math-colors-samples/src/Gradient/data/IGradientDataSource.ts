import type { IColor, INewGradient } from "@monorepo/core-math-colors";

export interface IGradientDataSource {
  getGradient(): INewGradient<IColor>;
}
