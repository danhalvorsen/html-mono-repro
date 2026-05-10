import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export class ProductCatalogWriter {
  async write(outputFile, catalog) {
    await mkdir(path.dirname(outputFile), { recursive: true });
    await writeFile(outputFile, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
  }
}