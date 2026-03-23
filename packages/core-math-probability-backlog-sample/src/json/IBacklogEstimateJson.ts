// =====================================================================================
// FILE: src/application/backlog/BacklogJsonContracts.ts
// =====================================================================================

export interface IBacklogEstimateJson {
    readonly optimistic: number;
    readonly mostLikely: number;
    readonly pessimistic: number;
}
