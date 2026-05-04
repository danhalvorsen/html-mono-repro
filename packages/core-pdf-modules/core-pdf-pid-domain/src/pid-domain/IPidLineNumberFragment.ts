import { PidFragmentKinds } from "./PidFragmentKind.js";
import type { IPidTagFragment } from "./IPidTagFragment.js";

export interface IPidLineNumberFragment
  extends IPidTagFragment<typeof PidFragmentKinds.LineNumber> {
}