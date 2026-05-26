import type { AstarVisualizerEventMap } from "../contracts/AstarVisualizerContracts.js";

export function dispatchAstarEvent<TName extends keyof AstarVisualizerEventMap>(
  target: EventTarget,
  type: TName,
  detail: AstarVisualizerEventMap[TName],
): void {
  target.dispatchEvent(
    new CustomEvent(type, {
      detail,
      bubbles: true,
      composed: true,
    }),
  );
}
