import type { IPidEquipmentTagFragment } from "./IPidEquipmentTagFragment.js";
import type { IPidInstrumentTagFragment } from "./IPidInstrumentTagFragment.js";
import type { IPidLineNumberFragment } from "./IPidLineNumberFragment.js";
import type { IPidTagCandidateFragment } from "./IPidTagCandidateFragment.js";

export type PidFragment =
  | IPidTagCandidateFragment
  | IPidEquipmentTagFragment
  | IPidInstrumentTagFragment
  | IPidLineNumberFragment;