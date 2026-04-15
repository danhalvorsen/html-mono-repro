export class LinearInterpolator3D {
    constructor(from, to, duration) {
        this.from = from;
        this.to = to;
        this.duration = duration;
        this._elapsed = 0;
        this._current = from.clone();
    }
    get start() {
        return this.from;
    }
    get end() {
        return this.to;
    }
    get isComplete() {
        return this.done;
    }
    evaluateAt(scalar) {
        return this.from.clone().lerp(this.to, scalar);
    }
    advanceBy(delta) {
        this._elapsed = Math.min(this._elapsed + delta, this.duration);
        const t = this._elapsed / this.duration;
        this._current = this.from.clone().lerp(this.to, t);
        return this._current;
    }
    get current() {
        return this._current;
    }
    get done() {
        return this._elapsed >= this.duration;
    }
    next(deltaTime) {
        this._elapsed = Math.min(this._elapsed + deltaTime, this.duration);
        const t = this._elapsed / this.duration;
        this._current = this.from.clone().lerp(this.to, t);
        return this._current;
    }
    reset() {
        this._elapsed = 0;
        this._current = this.from.clone();
    }
}
//# sourceMappingURL=LinearInterpolator3D.js.map