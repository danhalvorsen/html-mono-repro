import { readFile } from "node:fs/promises";

import type {
  IPidFragmentsDocument,
  IPidFragmentsRepository,
} from "./PidFragmentContracts.js";

export class PidFragmentsJsonFileRepository implements IPidFragmentsRepository {
  public constructor(
    private readonly filePath: string,
  ) {}

  public async read(): Promise<IPidFragmentsDocument> {
    const content = await readFile(this.filePath, "utf-8");
    const parsed = JSON.parse(content) as IPidFragmentsDocument;

    if (!Array.isArray(parsed.fragments)) {
      throw new Error("Invalid PID fragments document: fragments must be an array.");
    }

    return parsed;
  }
}
