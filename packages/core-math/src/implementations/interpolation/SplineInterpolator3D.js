export class SplineInterpolator3D {
    constructor(spline, duration // Total traversal time
    ) {
        this.spline = spline;
        this.duration = duration;
        this._elapsed = 0;
        this.isComplete = false;
        this._current = spline.getPointAt(0);
    }
    evaluateAt(scalar) {
        throw new Error("Method not implemented.");
    }
    advanceBy(delta) {
        throw new Error("Method not implemented.");
    }
    get from() {
        return this.spline.getPointAt(0);
    }
    get to() {
        return this.spline.getPointAt(1);
    }
    get current() {
        return this._current;
    }
    get done() {
        return this._elapsed >= this.duration;
    }
    next(deltaTime) {
        this._elapsed = Math.min(this._elapsed + deltaTime, this.duration);
        const t = this._elapsed / this.duration * (this.spline.getPoints().length - 1);
        this._current = this.spline.getPointAt(t);
        return this._current;
    }
    reset() {
        this._elapsed = 0;
        this._current = this.spline.getPointAt(0);
    }
}
//# sourceMappingURL=SplineInterpolator3D.js.map