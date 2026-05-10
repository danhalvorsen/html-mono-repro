import type { IMxGraphRootNameNormalizer } from "../ports/IMxGraphRootNameNormalizer.js";

const MxGraphRootNamePrefix = "mxGraph.";

export class MxGraphRootNameNormalizer implements IMxGraphRootNameNormalizer {
  public normalize(sourceName: string): string {
    if (sourceName.startsWith(MxGraphRootNamePrefix)) {
      return sourceName.slice(MxGraphRootNamePrefix.length);
    }

    return sourceName;
  }
}