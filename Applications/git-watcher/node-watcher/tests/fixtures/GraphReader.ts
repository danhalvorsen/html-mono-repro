import * as fs from "node:fs/promises";
import type { GraphJsonDocument } from "./GraphAssertions.js";

export class GraphReader {
  public constructor(private readonly graphOutputPath: string) {}

  public async exists(): Promise<boolean> {
    try {
      await fs.access(this.graphOutputPath);
      return true;
    } catch {
      return false;
    }
  }

  public async read(): Promise<GraphJsonDocument> {
    return JSON.parse(await fs.readFile(this.graphOutputPath, "utf8")) as GraphJsonDocument;
  }
}
