import type { IPdfTextFragment } from "../IPdfTextFragment.js";
import type { IPdfClusterFinding } from "./IPdfClusterFinding.js";

export interface IPdfClusterExportRecord {
  readonly fragment: IPdfTextFragment;
  readonly finding: IPdfClusterFinding;
}
