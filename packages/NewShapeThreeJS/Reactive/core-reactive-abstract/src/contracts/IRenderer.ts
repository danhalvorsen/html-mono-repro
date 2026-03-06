// packages/core-three-reactive/src/SceneManager.ts
// ============================================================================
// SceneManager (reactive rendering gate)
// - Calls updateIfNeeded() on shapes
// - Only renders when at least one shape updated
// ============================================================================

export interface IRenderer {
  render(): void; 
}
