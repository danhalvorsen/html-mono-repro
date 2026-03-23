import { DistributionKind } from "../value-objects/Probability.js";

export interface IDistributionSummary {
    readonly kind: DistributionKind;
    readonly pdfSupported: boolean;
    readonly cdfSupported: boolean;
    readonly inverseCdfSupported: boolean;
}
