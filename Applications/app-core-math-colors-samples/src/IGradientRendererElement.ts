import type { IColor, INewGradient } from "@monorepo/core-math-colors";
import type { IGradientRenderer } from "./IGradientRenderer";


export interface IGradientRendererElement extends HTMLElement, IGradientRenderer<INewGradient<IColor>> { }
