
export interface IEstimateStatistics {
    readonly mean: number;
    readonly variance: number;
    readonly standardDeviation: number;
    readonly minimum: number;
    readonly maximum: number;
    readonly percentile50: number;
    readonly percentile80: number;
    readonly percentile90: number;
    readonly percentile95: number;
}
