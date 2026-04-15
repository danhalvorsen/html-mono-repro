export class HermiteInterpolationStrategy {
    constructor(interpolateFn) {
        this.interpolateFn = interpolateFn;
    }
    interpolate(segment, t) {
        return this.interpolateFn(segment, t);
    }
}
//# sourceMappingURL=HermiteInterpolationStrategy.1.js.map