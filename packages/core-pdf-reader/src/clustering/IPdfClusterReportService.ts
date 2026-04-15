import type { IPdfClusterExportRecord } from "./IPdfClusterExportRecord.js";

export interface IPdfClusterReportService {
  readPriceClusterRecords(binary: Uint8Array): Promise<readonly IPdfClusterExportRecord[]>;
}
