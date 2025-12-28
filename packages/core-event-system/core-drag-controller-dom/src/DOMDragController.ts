import {
  BaseDragController,
  CommonEvent,
  Drag,
  IDragEndData,
  IDragMoveData,
  IDragStartData,
  ICommonEvent,
  IMouseController,
  Position,
  TimeStamp
} from "core-drag-controller-abstract";

const DRAG_START_EVENT = "DRAG_START" as Drag.DRAG_START;
const DRAG_MOVE_EVENT = "DRAG_MOVE" as Drag.DRAG_MOVE;
const DRAG_END_EVENT = "DRAG_END" as Drag.DRAG_END;

export class DOMDragController extends BaseDragController {
  private readonly mouse: IMouseController;

  private dragging = false;
  private startPos: Position | null = null;
  private lastPos: Position | null = null;

  constructor(mouseController: IMouseController) {
    super();
    this.mouse = mouseController;

    this.mouse.onDown((pos: Position): void => this.beginDrag(pos));
    this.mouse.onMove((pos: Position): void => this.updateDrag(pos));
    this.mouse.onUp((pos: Position): void => this.endDrag(pos));
  }

  private beginDrag(pos: Position): void {
    this.dragging = true;
    this.startPos = pos;
    this.lastPos = pos;

    const data: IDragStartData = {
      event: Drag.DRAG_START,
      start: pos
    };

    const evt: ICommonEvent<IDragStartData> = new CommonEvent(
      Drag.DRAG_START,
      TimeStamp.now(),
      data
    );

    this.emitStart(evt);
  }

  private updateDrag(pos: Position): void {
    if (!this.dragging || !this.startPos || !this.lastPos) return;

    const delta: Position = {
      x: pos.x - this.lastPos.x,
      y: pos.y - this.lastPos.y
    };

    const data: IDragMoveData = {
      event: DRAG_MOVE_EVENT,
      start: this.startPos,
      current: pos,
      delta
    };

    const evt: ICommonEvent<IDragMoveData> = new CommonEvent(
      DRAG_MOVE_EVENT,
      TimeStamp.now(),
      data
    );

    this.lastPos = pos;
    this.emitMove(evt);
  }

  private endDrag(pos: Position): void {
    if (!this.dragging || !this.startPos) return;

    this.dragging = false;

    const data: IDragEndData = {
      event: DRAG_END_EVENT,
      start: this.startPos,
      end: pos
    };

    const evt: ICommonEvent<IDragEndData> = new CommonEvent(
      DRAG_END_EVENT,
      TimeStamp.now(),
      data
    );

    this.emitEnd(evt);

    this.startPos = null;
    this.lastPos = null;
  }

  dispose(): void {
    this.dragging = false;
    this.startPos = null;
    this.lastPos = null;
  }
}
