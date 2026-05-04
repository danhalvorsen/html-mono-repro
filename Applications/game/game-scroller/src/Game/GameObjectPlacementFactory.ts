import type { GameObjectViewModel } from "./GameCanvas";

export class GameObjectPlacementFactory {
  public create(): readonly GameObjectViewModel[] {
    return [
      {
        id: 'game-object-0',
        slot: 'overlay-start',
        fill: '#60a5fa',
        stroke: '#1d4ed8',
        size: 10,
        indexOffsetRatio: 0,
        followCamera: true
      }
    ];
  }
}
