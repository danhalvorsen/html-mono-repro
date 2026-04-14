import type { ICompositePdfEngine } from "../engine/ICompositePdfEngine.js";
import type { IPdfTextFragment } from "../IPdfTextFragment.js";
import type { IPdfClusterExportRecord } from "./IPdfClusterExportRecord.js";
import type { IPdfClusterFinding } from "./IPdfClusterFinding.js";
import type { IPdfClusterReportService } from "./IPdfClusterReportService.js";

export class PdfPriceClusterReportService implements IPdfClusterReportService {
  public constructor(private readonly engine: ICompositePdfEngine) {}

  public async readPriceClusterRecords(binary: Uint8Array): Promise<readonly IPdfClusterExportRecord[]> {
    const fragments = await this.engine.readTextFragments(binary);

    const byPage = new Map<number, IPdfTextFragment[]>();
    for (const f of fragments) {
      const list = byPage.get(f.pageNumber);
      if (!list) byPage.set(f.pageNumber, [f]);
      else list.push(f);
    }

    const output: IPdfClusterExportRecord[] = [];

    for (const [page, pageFragments] of byPage) {
      const visited = new Set<IPdfTextFragment>();

      for (const seed of pageFragments) {
        if (visited.has(seed)) continue;

        const tol = seed.height * 0.5;

        const cluster = pageFragments.filter(f => Math.abs(f.y - seed.y) <= tol)
          .sort((a,b)=>a.x-b.x);

        cluster.forEach(f => visited.add(f));

        const text = cluster.map(f => f.text).join(" ");

        if (!/\b\d{1,4}([.,]\d{2})?\b/.test(text)) continue;

        const finding: IPdfClusterFinding = {
          page,
          text,
          hasPrice: true,
          fragmentCount: cluster.length
        };

        cluster.forEach(f => {
          output.push({ fragment: f, finding });
        });
      }
    }

    return Object.freeze(output);
  }
}
