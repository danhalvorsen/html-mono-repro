/* ============================================================================
 * Context (async-safe, shared)
 * ============================================================================ */

export interface IContextPipeline {
  set<T>(key: symbol, value: T): void;
  get<T>(key: symbol): T | undefined;
}
