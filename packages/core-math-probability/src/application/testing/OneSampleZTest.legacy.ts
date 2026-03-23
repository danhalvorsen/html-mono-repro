
// =====================================================================================
// APPLICATION — HYPOTHESIS TESTING
// =====================================================================================

import { IOneSampleZTest } from "../../domain/contracts/IOneSampleZTest.js";
import { Probability, TailKind, IZTestResult } from "../../domain/value-objects/Probability.js";
import { NormalDistribution } from "../../infrastructure/distributions/NormalDistribution.js";
import { NumericGuard } from "../../infrastructure/numerics/NumericGuard.js";

export class OneSampleZTest implements IOneSampleZTest {
    private readonly standardNormal = new NormalDistribution(0, 1);

    public test(
        sampleMean: number,
        hypothesizedMean: number,
        populationStandardDeviation: number,
        sampleSize: number,
        alpha: Probability,
        tail: TailKind
    ): IZTestResult {
        NumericGuard.finite(sampleMean, "sampleMean");
        NumericGuard.finite(hypothesizedMean, "hypothesizedMean");
        NumericGuard.positive(populationStandardDeviation, "populationStandardDeviation");

        if (!Number.isInteger(sampleSize) || sampleSize <= 0) {
            throw new RangeError("sampleSize must be a positive integer.");
        }

        const statistic = (sampleMean - hypothesizedMean) /
            (populationStandardDeviation / Math.sqrt(sampleSize));

        const pValue = this.resolvePValue(statistic, tail);
        const criticalValue = this.resolveCriticalValue(alpha.value, tail);
        const rejectNull = this.resolveReject(statistic, criticalValue, tail);

        return {
            statistic,
            pValue,
            alpha: alpha.value,
            rejectNull,
            criticalValue,
        };
    }

    private resolvePValue(statistic: number, tail: TailKind): number {
        const cdf = this.standardNormal.cdf(statistic);

        switch (tail) {
            case TailKind.Left:
                return cdf;
            case TailKind.Right:
                return 1 - cdf;
            case TailKind.TwoSided:
                return 2 * Math.min(cdf, 1 - cdf);
        }
    }

    private resolveCriticalValue(alpha: number, tail: TailKind): number {
        switch (tail) {
            case TailKind.Left:
                return this.standardNormal.inverseCdf(alpha);
            case TailKind.Right:
                return this.standardNormal.inverseCdf(1 - alpha);
            case TailKind.TwoSided:
                return this.standardNormal.inverseCdf(1 - alpha / 2);
        }
    }

    private resolveReject(statistic: number, criticalValue: number, tail: TailKind): boolean {
        switch (tail) {
            case TailKind.Left:
                return statistic < criticalValue;
            case TailKind.Right:
                return statistic > criticalValue;
            case TailKind.TwoSided:
                return Math.abs(statistic) > Math.abs(criticalValue);
        }
    }
}
