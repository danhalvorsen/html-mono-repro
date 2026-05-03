import { Guard } from "./Guard.js";


export class Arithmetic {
    private constructor() { }

    public static readonly PointsPerInch = 72;
    public static readonly MillimetersPerInch = 25.4;
    public static readonly CentimetersPerInch = 2.54;

    public static clamp(value: number, min: number, max: number): number {
        Guard.finite(value, "Arithmetic.clamp.value");
        Guard.finite(min, "Arithmetic.clamp.min");
        Guard.finite(max, "Arithmetic.clamp.max");

        const normalizedMin = Math.min(min, max);
        const normalizedMax = Math.max(min, max);

        return Math.min(Math.max(value, normalizedMin), normalizedMax);
    }

    public static nearlyEqual(left: number, right: number, epsilon = 1e-9): boolean {
        Guard.finite(left, "Arithmetic.nearlyEqual.left");
        Guard.finite(right, "Arithmetic.nearlyEqual.right");
        Guard.nonNegative(epsilon, "Arithmetic.nearlyEqual.epsilon");

        return Math.abs(left - right) <= epsilon;
    }

    public static pointsToInches(points: number): number {
        Guard.finite(points, "Arithmetic.pointsToInches.points");
        return points / this.PointsPerInch;
    }

    public static inchesToPoints(inches: number): number {
        Guard.finite(inches, "Arithmetic.inchesToPoints.inches");
        return inches * this.PointsPerInch;
    }

    public static pointsToMillimeters(points: number): number {
        return this.pointsToInches(points) * this.MillimetersPerInch;
    }

    public static millimetersToPoints(millimeters: number): number {
        Guard.finite(millimeters, "Arithmetic.millimetersToPoints.millimeters");
        return (millimeters / this.MillimetersPerInch) * this.PointsPerInch;
    }

    public static pointsToCentimeters(points: number): number {
        return this.pointsToInches(points) * this.CentimetersPerInch;
    }

    public static centimetersToPoints(centimeters: number): number {
        Guard.finite(centimeters, "Arithmetic.centimetersToPoints.centimeters");
        return (centimeters / this.CentimetersPerInch) * this.PointsPerInch;
    }

    public static degreesToRadians(degrees: number): number {
        Guard.finite(degrees, "Arithmetic.degreesToRadians.degrees");
        return (degrees * Math.PI) / 180;
    }

    public static radiansToDegrees(radians: number): number {
        Guard.finite(radians, "Arithmetic.radiansToDegrees.radians");
        return (radians * 180) / Math.PI;
    }

    public static round(value: number, decimals = 0): number {
        Guard.finite(value, "Arithmetic.round.value");
        Guard.nonNegative(decimals, "Arithmetic.round.decimals");

        const factor = 10 ** decimals;
        return Math.round(value * factor) / factor;
    }
}
