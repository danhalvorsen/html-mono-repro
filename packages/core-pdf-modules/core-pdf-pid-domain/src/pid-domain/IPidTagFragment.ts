import type { IPidFragment } from "./IPidFragment.js";
import type { PidFragmentKind } from "./PidFragmentKind.js";

export interface IPidTagFragment<TKind extends PidFragmentKind = PidFragmentKind>
  extends IPidFragment<TKind> {
  readonly text: string;
  readonly normalizedText: string;
  readonly confidence: number;
}