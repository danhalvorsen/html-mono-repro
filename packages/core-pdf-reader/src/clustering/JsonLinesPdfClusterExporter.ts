import type { IPdfClusterExporter } from "./IPdfClusterExporter.js";
import type { IPdfClusterExportRecord } from "./IPdfClusterExportRecord.js";

export class JsonLinesPdfClusterExporter implements IPdfClusterExporter {
  public export(records: readonly IPdfClusterExportRecord[]): string {
    return records
      .map((r) => JSON.stringify({
        fragment: {
          page: r.fragment.pageNumber,
          text: r.fragment.text,
          x: r.fragment.x,
          y: r.fragment.y,
          w: r.fragment.width,
          h: r.fragment.height,
        },
        finding: r.finding,
      }))
      .join("\n");
  }
}
