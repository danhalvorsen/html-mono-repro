
import type { IRangeBehavior } from "../range/IRangeBehavior.js";
import type { INewColorInterpolationSpace } from "./INewColorInterpolationSpace.js";
import type { INewColorInterpolator } from "./INewColorInterpolator.js";
import type { NewGradientStop } from "../colors/NewGradientStop.js";
import { NewGradient } from "../colors/NewGradient.js";

export class NewGradientStopInterpolator<TColor> implements INewColorInterpolator<TColor> {
    private static readonly EPSILON = 1e-12;

    private readonly gradient: NewGradient<TColor>;
    private readonly rangeBehavior: IRangeBehavior;
    private readonly interpolationSpace: INewColorInterpolationSpace<TColor>;

    public constructor(
        gradient: NewGradient<TColor>,
        rangeBehavior: IRangeBehavior,
        interpolationSpace: INewColorInterpolationSpace<TColor>
    ) {
        this.gradient = gradient;
        this.rangeBehavior = rangeBehavior;
        this.interpolationSpace = interpolationSpace;
    }

    public sample(position: number): TColor {
        const normalized = this.rangeBehavior.normalize(position);

        if (this.gradient.count === 1) {
            return this.gradient.getAt(0).color;
        }

        const first = this.gradient.getAt(0);
        const last = this.gradient.getAt(this.gradient.count - 1);

        if (normalized <= first.position) {
            return first.color;
        }

        if (normalized >= last.position) {
            return last.color;
        }

        for (let index = 0; index < this.gradient.count - 1; index += 1) {
            const start = this.gradient.getAt(index);
            const end = this.gradient.getAt(index + 1);

            if (normalized >= start.position && normalized <= end.position) {
                return this.interpolateBetween(start, end, normalized);
            }
        }

        return last.color;
    }

    public sampleMany(positions: readonly number[]): readonly TColor[] {
        return positions.map((position) => this.sample(position));
    }

    private interpolateBetween(
        start: NewGradientStop<TColor>,
        end: NewGradientStop<TColor>,
        position: number
    ): TColor {
        const range = end.position - start.position;

        if (range === 0) {
            return end.color;
        }

        const localAmount = this.stabilizeUnitInterval(
            (position - start.position) / range
        );

        return this.interpolationSpace.interpolate(start.color, end.color, localAmount);
    }

    private stabilizeUnitInterval(value: number): number {
        if (Math.abs(value) <= NewGradientStopInterpolator.EPSILON) {
            return 0;
        }

        if (Math.abs(1 - value) <= NewGradientStopInterpolator.EPSILON) {
            return 1;
        }

        if (Math.abs(value - 0.5) <= NewGradientStopInterpolator.EPSILON) {
            return 0.5;
        }

        return value;
    }
}
