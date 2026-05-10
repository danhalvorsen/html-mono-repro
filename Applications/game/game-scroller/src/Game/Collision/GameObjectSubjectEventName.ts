import type { GameObjectSubjectEvents } from '../GameObjectSubject.js';

export const GameObjectSubjectEventName = {
  PositionChanged: 'positionChanged',
} as const satisfies {
  readonly PositionChanged: keyof GameObjectSubjectEvents;
};
