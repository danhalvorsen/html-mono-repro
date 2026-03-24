 
// Incomplete beta via continued fraction (Numerical Recipes style)

import { NumericGuard } from "./NumericGuard.js";

export class BetaFunctions {
    private static readonly epsilon = 3e-14;
    private static readonly maxIterations = 200;

    public static logGamma(z: number): number {
        NumericGuard.positive(z, "z");

        const coefficients = [
            676.5203681218851,
            -1259.1392167224028,
            771.3234287776531,
            -176.6150291621406,
            12.507343278686905,
            -0.13857109526572012,
            9.984369578019572e-6,
            1.5056327351493116e-7,
        ] as const;

        if (z < 0.5) {
            return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - this.logGamma(1 - z);
        }

        let x = 0.9999999999998099;
        const zz = z - 1;

        for (const coeff of coefficients) {
            x += coeff / (zz + coefficients.indexOf(coeff) + 1);
        }

        const t = zz + coefficients.length - 0.5;

        return 0.5 * Math.log(2 * Math.PI) + (zz + 0.5) * Math.log(t) - t + Math.log(x);
    }

    public static beta(a: number, b: number): number {
        NumericGuard.positive(a, "a");
        NumericGuard.positive(b, "b");

        return Math.exp(this.logGamma(a) + this.logGamma(b) - this.logGamma(a + b));
    }

    public static regularizedIncompleteBeta(x: number, a: number, b: number): number {
        NumericGuard.probability(x, "x");
        NumericGuard.positive(a, "a");
        NumericGuard.positive(b, "b");

        if (x === 0) return 0;
        if (x === 1) return 1;

        const bt = Math.exp(
            this.logGamma(a + b) - this.logGamma(a) - this.logGamma(b) +
            a * Math.log(x) +
            b * Math.log(1 - x)
        );

        if (x < (a + 1) / (a + b + 2)) {
            return (bt * this.betaFraction(x, a, b)) / a;
        }

        return 1 - (bt * this.betaFraction(1 - x, b, a)) / b;
    }

    private static betaFraction(x: number, a: number, b: number): number {
        let qab = a + b;
        let qap = a + 1;
        let qam = a - 1;

        let c = 1;
        let d = 1 - (qab * x) / qap;
        if (Math.abs(d) < Number.EPSILON) d = Number.EPSILON;
        d = 1 / d;

        let h = d;

        for (let m = 1; m <= this.maxIterations; m += 1) {
            const m2 = 2 * m;

            let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
            d = 1 + aa * d;
            if (Math.abs(d) < Number.EPSILON) d = Number.EPSILON;
            c = 1 + aa / c;
            if (Math.abs(c) < Number.EPSILON) c = Number.EPSILON;
            d = 1 / d;
            h *= d * c;

            aa = -((a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
            d = 1 + aa * d;
            if (Math.abs(d) < Number.EPSILON) d = Number.EPSILON;
            c = 1 + aa / c;
            if (Math.abs(c) < Number.EPSILON) c = Number.EPSILON;
            d = 1 / d;

            const delta = d * c;
            h *= delta;

            if (Math.abs(delta - 1) < this.epsilon) {
                break;
            }
        }

        return h;
    }
}
