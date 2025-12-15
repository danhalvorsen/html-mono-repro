/**
 * Layer-0 abstraction of the 4 Lit lifecycle phases.
 * Independent of DOM, Three.js or Canvas.
 */
export interface IReactiveLifecycle {
  onHostConnected(): void;
  onHostDisconnected(): void;
  onHostUpdate(): void;
  onHostUpdated(): void;
}