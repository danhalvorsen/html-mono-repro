import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CompositePdfEngine } from "../src/engine/CompositePdfEngine.js";
import { PdfPriceClusterReportService } from "../src/clustering/PdfPriceClusterReportService.js";
import { JsonLinesPdfClusterExporter } from "../src/clustering/JsonLinesPdfClusterExporter.js";

describe("price clusters export", () => {
  it("should export clusters as jsonl", async () => {
    const input = join(process.cwd(), "tests", "Kiwi.pdf");
    const output = join(process.cwd(), "tests", "Kiwi.price-clusters.full.jsonl");

    const binary = new Uint8Array(await readFile(input));

    const engine = new CompositePdfEngine();
    const service = new PdfPriceClusterReportService(engine);
    const exporter = new JsonLinesPdfClusterExporter();

    const records = await service.readPriceClusterRecords(binary);
    const json = exporter.export(records);

    await writeFile(output, json, "utf-8");

    expect(records.length).toBeGreaterThan(0);
  });
});
