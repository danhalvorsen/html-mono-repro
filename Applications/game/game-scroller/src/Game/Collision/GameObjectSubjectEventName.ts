import type { GameObjectSubjectEvents } from '@monorepo/game-design-patterns';

export const GameObjectSubjectEventName = {
  PositionChanged: 'positionChanged',
} as const satisfies {
  readonly PositionChanged: keyof GameObjectSubjectEvents;
};
