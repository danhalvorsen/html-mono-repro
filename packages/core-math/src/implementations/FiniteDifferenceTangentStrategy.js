export class FiniteDifferenceTangentStrategy {
    estimate(points, index) {
        const prev = points[index - 1] ?? points[index];
        const next = points[index + 1] ?? points[index];
        return next.subtract(prev).scale(0.5); // Updated to use 'scale' for scalar multiplication
    }
}
//# sourceMappingURL=FiniteDifferenceTangentStrategy.js.map