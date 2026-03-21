import type { IGradient } from "@monorepo/core-math-colors";

export interface IGradientDataSource {
  getGradient(): IGradient;
}