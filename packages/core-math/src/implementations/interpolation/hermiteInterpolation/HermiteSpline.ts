import { IControlPointStrategy } from "../../../interfaces/IControlPointStrategy.js";
import { IInterpolationStrategy } from "../../../interfaces/IInterpolationStrategy.js";
import { ISpline } from "../../../interpolation/ISpline.js";
import { HermiteSegment } from "./HermiteSegment.js";

export class HermiteSpline<T> implements ISpline<T> {
    constructor(
        public readonly controlPoints: T[],
        private readonly tangentStrategy: IControlPointStrategy<T>,
        private readonly interpolationStrategy: IInterpolationStrategy<T, number>,
        public readonly isClosed: boolean = false
    ) { }

    get domain(): [number, number] {
        return [0, this.controlPoints.length - 1];
    }

    at(t: number): T {
        const i = Math.floor(t);
        const localT = t - i;

        const p0 = this.controlPoints[i];
        const p1 = this.controlPoints[i + 1];

        const m0 = this.tangentStrategy.estimate(this.controlPoints, i);
        const m1 = this.tangentStrategy.estimate(this.controlPoints, i + 1);

        const segment = new HermiteSegment(p0, p1, m0, m1);
        return this.interpolationStrategy.interpolate(segment, localT);
    }

    getPointAt(t: number): T {
        return this.at(t);
    }

    getLength(): number {
        throw new Error("Method not implemented.");
    }

    getPoints(): T[] {
        return this.controlPoints;
    }
}
