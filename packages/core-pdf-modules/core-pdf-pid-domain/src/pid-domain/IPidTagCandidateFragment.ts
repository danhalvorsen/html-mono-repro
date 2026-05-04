import { PidFragmentKinds } from "./PidFragmentKind.js";
import type { IPidTagFragment } from "./IPidTagFragment.js";

export interface IPidTagCandidateFragment
  extends IPidTagFragment<typeof PidFragmentKinds.TagCandidate> {
}