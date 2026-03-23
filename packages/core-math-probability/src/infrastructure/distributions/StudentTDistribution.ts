import { BetaFunctions } from "../numerics/BetaFunctions.js";

export class StudentTDistribution {
    public constructor(private readonly degreesOfFreedom: number) {
        if (!Number.isInteger(degreesOfFreedom) || degreesOfFreedom <= 0) {
            throw new RangeError("degreesOfFreedom must be a positive integer.");
        }
    }

    public pdf(x: number): number {
        const nu = this.degreesOfFreedom;
        const numerator = Math.exp(BetaFunctions.logGamma((nu + 1) / 2));
        const denominator = Math.sqrt(nu * Math.PI) *
            Math.exp(BetaFunctions.logGamma(nu / 2));
        return numerator / denominator * Math.pow(1 + (x * x) / nu, -(nu + 1) / 2);
    }

    public cdf(x: number): number {
        const nu = this.degreesOfFreedom;
        const t = nu / (nu + x * x);
        const ib = BetaFunctions.regularizedIncompleteBeta(t, nu / 2, 0.5);

        if (x >= 0) {
            return 1 - 0.5 * ib;
        }

        return 0.5 * ib;
    }
}
