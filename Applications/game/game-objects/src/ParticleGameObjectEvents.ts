import type { ParticleGameObject } from "./ParticleGameObject.js";

export const ParticleGameObjectEventName = {
  Died: "particle-game-object-died",
} as const;

export type ParticleGameObjectDiedEvent = CustomEvent<{
  readonly particle: ParticleGameObject;
}>;

export function createParticleGameObjectDiedEvent(
  particle: ParticleGameObject,
): ParticleGameObjectDiedEvent {
  return new CustomEvent(ParticleGameObjectEventName.Died, {
    bubbles: true,
    composed: true,
    detail: {
      particle,
    },
  });
}