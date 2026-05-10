import type { GameObjectViewModel } from "./GameCanvas.js";

export class GameObjectPlacementFactory {
  public create(): readonly GameObjectViewModel[] {
    return [
      {
        kind: "rectangle",
        id: "game-object-0",
        slot: "overlay-start",
        fill: "#60a5fa",
        stroke: "#1d4ed8",
        size: 10,
        indexOffsetRatio: 0,
        followCamera: true,
      },
    ];
  }
}
