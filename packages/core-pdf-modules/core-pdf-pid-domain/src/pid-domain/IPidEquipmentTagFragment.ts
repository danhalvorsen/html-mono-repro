import { PidFragmentKinds } from "./PidFragmentKind.js";
import type { IPidTagFragment } from "./IPidTagFragment.js";

export interface IPidEquipmentTagFragment
  extends IPidTagFragment<typeof PidFragmentKinds.EquipmentTag> {
}