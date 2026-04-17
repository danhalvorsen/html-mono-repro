// ============================================================================
// ============================================================================
import type { IPdfJsTextStyle } from "./IPdfJsTextStyle.js";

export interface IPdfJsTextContent {
    readonly items: readonly unknown[];
    readonly styles?: Readonly<Record<string, IPdfJsTextStyle>> | undefined;
}
