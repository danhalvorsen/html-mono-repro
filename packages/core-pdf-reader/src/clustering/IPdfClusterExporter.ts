import type { IPdfClusterExportRecord } from "./IPdfClusterExportRecord.js";

export interface IPdfClusterExporter {
  export(records: readonly IPdfClusterExportRecord[]): string;
}
