import { HermiteSegment } from "./HermiteSegment.js";
export class HermiteSpline {
    constructor(controlPoints, tangentStrategy, interpolationStrategy, isClosed = false) {
        this.controlPoints = controlPoints;
        this.tangentStrategy = tangentStrategy;
        this.interpolationStrategy = interpolationStrategy;
        this.isClosed = isClosed;
    }
    get domain() {
        return [0, this.controlPoints.length - 1];
    }
    at(t) {
        const i = Math.floor(t);
        const localT = t - i;
        const p0 = this.controlPoints[i];
        const p1 = this.controlPoints[i + 1];
        const m0 = this.tangentStrategy.estimate(this.controlPoints, i);
        const m1 = this.tangentStrategy.estimate(this.controlPoints, i + 1);
        const segment = new HermiteSegment(p0, p1, m0, m1);
        return this.interpolationStrategy.interpolate(segment, localT);
    }
    getPointAt(t) {
        return this.at(t);
    }
    getLength() {
        throw new Error("Method not implemented.");
    }
    getPoints() {
        return this.controlPoints;
    }
}
//# sourceMappingURL=HermiteSpline.js.map