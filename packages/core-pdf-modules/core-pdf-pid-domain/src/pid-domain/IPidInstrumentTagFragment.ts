import { PidFragmentKinds } from "./PidFragmentKind.js";
import type { IPidTagFragment } from "./IPidTagFragment.js";

export interface IPidInstrumentTagFragment
  extends IPidTagFragment<typeof PidFragmentKinds.InstrumentTag> {
}