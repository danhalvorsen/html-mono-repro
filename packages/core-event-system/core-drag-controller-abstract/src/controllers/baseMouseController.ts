import { Position } from "../types/common/position.js";
 
export namespace Mouse {
  export interface IMouseController {
  onMove(handler: (pos: Position) => void): void;
  onDown(handler: (pos: Position) => void): void;
  onUp(handler: (pos: Position) => void): void;
  onWheel(handler: (delta: number, pos: Position) => void): void;
  dispose(): void;
}

  export abstract class BaseMouseController implements IMouseController {
    private readonly moveHandlers = new Set<(pos: Position) => void>();
    private readonly downHandlers = new Set<(pos: Position) => void>();
    private readonly upHandlers = new Set<(pos: Position) => void>();
    private readonly wheelHandlers = new Set<
      (delta: number, pos: Position) => void
    >();

    onMove(handler: (pos: Position) => void): void {
      this.moveHandlers.add(handler);
    }

    onDown(handler: (pos: Position) => void): void {
      this.downHandlers.add(handler);
    }

    onUp(handler: (pos: Position) => void): void {
      this.upHandlers.add(handler);
    }

    onWheel(handler: (delta: number, pos: Position) => void): void {
      this.wheelHandlers.add(handler);
    }

    protected emitMove(pos: Position): void {
      for (const h of this.moveHandlers) h(pos);
    }

    protected emitDown(pos: Position): void {
      for (const h of this.downHandlers) h(pos);
    }

    protected emitUp(pos: Position): void {
      for (const h of this.upHandlers) h(pos);
    }

    protected emitWheel(delta: number, pos: Position): void {
      for (const h of this.wheelHandlers) h(delta, pos);
    }

    abstract dispose(): void;
  }
}
