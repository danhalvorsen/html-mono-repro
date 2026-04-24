import {
  BaseDragController,
  CommonEvent,
  Drag,
  ICommonEvent,
  IDragEndData,
  IDragMoveData,
  IDragStartData,
  Position,
  TimeStamp,
  Mouse
} from "@monorepo/core-drag-controller-abstract";

export namespace SvgDrag {
  export class SVGDragController extends BaseDragController {
    private readonly svg: SVGSVGElement;
    private readonly mouse: Mouse.IMouseController;

    private dragging = false;
    private startPos: Position | null = null;
    private lastPos: Position | null = null;

constructor(svgRoot: SVGSVGElement, mouseController: Mouse.IMouseController){
      super();
      this.svg = svgRoot;
      this.mouse = mouseController;

      this.mouse.onDown((pos: Position): void => this.beginDrag(pos));
      this.mouse.onMove((pos: Position): void => this.updateDrag(pos));
      this.mouse.onUp((pos: Position): void => this.endDrag(pos));
    }

    private toSvgPosition(pos: Position): Position {
      const pt = this.svg.createSVGPoint();
      pt.x = pos.x;
      pt.y = pos.y;

      const ctm = this.svg.getScreenCTM();
      if (!ctm) return pos;

      const local = pt.matrixTransform(ctm.inverse());
      return { x: local.x, y: local.y };
    }

    private beginDrag(pos: Position): void {
      const local = this.toSvgPosition(pos);

      this.dragging = true;
      this.startPos = local;
      this.lastPos = local;

      const data: IDragStartData = {
        event: Drag.DRAG_START,
        start: local
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

      const local = this.toSvgPosition(pos);

      const delta: Position = {
        x: local.x - this.lastPos.x,
        y: local.y - this.lastPos.y
      };

      const data: IDragMoveData = {
        event: Drag.DRAG_MOVE,
        start: this.startPos,
        current: local,
        delta
      };

      const evt: ICommonEvent<IDragMoveData> = new CommonEvent(
        Drag.DRAG_MOVE,
        TimeStamp.now(),
        data
      );

      this.lastPos = local;
      this.emitMove(evt);
    }

    private endDrag(pos: Position): void {
      if (!this.dragging || !this.startPos) return;

      const local = this.toSvgPosition(pos);

      const data: IDragEndData = {
        event: Drag.DRAG_END,
        start: this.startPos,
        end: local
      };

      const evt: ICommonEvent<IDragEndData> = new CommonEvent(
        Drag.DRAG_END,
        TimeStamp.now(),
        data
      );

      this.emitEnd(evt);

      this.dragging = false;
      this.startPos = null;
      this.lastPos = null;
    }

    dispose(): void {
      this.dragging = false;
      this.startPos = null;
      this.lastPos = null;
    }
  }
}

export const SVGDragController = SvgDrag.SVGDragController;
