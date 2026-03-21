import type { IGradient } from "@monorepo/core-math-colors";
import type { IGradientRenderer } from "./IGradientRenderer";


export interface IGradientRendererElement extends HTMLElement, IGradientRenderer<IGradient> { }
