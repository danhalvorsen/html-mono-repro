// src/lit3/Controllers/Drag/IDragOperations.ts

import { Vector2 } from "@monorepo/core-math";
import { IDraggable } from "./IDraggable.js";
 
export interface IDragOperations {
  onDragStart(target: IDraggable, position: Vector2): void;

  onDrag(target: IDraggable, position: Vector2): void;

  onDragOver(target: IDraggable, position: Vector2): void;

  onDrop(target: IDraggable, position: Vector2): void;

  onCancel(target: IDraggable): void;
}