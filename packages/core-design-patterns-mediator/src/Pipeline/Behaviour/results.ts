
/* ============================================================================
 * Behaviors (typed results)
 * ============================================================================ */

export type ValidationOk = { behavior: "validation" };
export type ValidationErr = { behavior: "validation"; reason: string };

export type PerformanceOk = { behavior: "performance"; ms: number };
export type PerformanceErr = { behavior: "performance"; ms: number };

