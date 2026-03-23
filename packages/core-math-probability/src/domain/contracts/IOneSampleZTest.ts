import { IZTestResult, Probability, TailKind } from "../value-objects/Probability.js";

export interface IOneSampleZTest {
    test(
        sampleMean: number,
        hypothesizedMean: number,
        populationStandardDeviation: number,
        sampleSize: number,
        alpha: Probability,
        tail: TailKind
    ): IZTestResult;
}
