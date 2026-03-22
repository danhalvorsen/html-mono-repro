
import type {
  ICDrag,
  ICDragDropParticipant,
  ICDragEnd,
  ICDragEnter,
  ICDragOver,
  ICDragLeave,
  ICDragStart,
  ICDrop,
  IDragContext,
  IDragOverContext,
  IDragSource,
  IDropTarget,
} from "./DragDropSemantics.js";

export abstract class CDragStart<TSource extends IDragSource>
  implements ICDragStart<TSource>
{
  public onDragStart(_context: IDragContext<TSource>): void {}
}

export abstract class CDrag<TSource extends IDragSource>
  implements ICDrag<TSource>
{
  public onDrag(_context: IDragContext<TSource>): void {}
}

export abstract class CDragEnd<TSource extends IDragSource>
  implements ICDragEnd<TSource>
{
  public onDragEnd(_context: IDragContext<TSource>): void {}
}

export abstract class CDragSource<TSource extends IDragSource>
  implements ICDragStart<TSource>, ICDrag<TSource>, ICDragEnd<TSource>
{
  public onDragStart(_context: IDragContext<TSource>): void {}

  public onDrag(_context: IDragContext<TSource>): void {}

  public onDragEnd(_context: IDragContext<TSource>): void {}
}

// ------------------------------------------------------------------------------------
// TARGET-SIDE STANDARD IMPLEMENTATION
// ------------------------------------------------------------------------------------

export abstract class CDragEnter<
  TSource extends IDragSource,
  TTarget extends IDropTarget,
> implements ICDragEnter<TSource, TTarget>
{
  public onDragEnter(_context: IDragOverContext<TSource, TTarget>): void {}
}

export abstract class CDragOver<
  TSource extends IDragSource,
  TTarget extends IDropTarget,
> implements ICDragOver<TSource, TTarget>
{
  public onDragOver(_context: IDragOverContext<TSource, TTarget>): void {}
}

export abstract class CDragLeave<
  TSource extends IDragSource,
  TTarget extends IDropTarget,
> implements ICDragLeave<TSource, TTarget>
{
  public onDragLeave(_context: IDragOverContext<TSource, TTarget>): void {}
}

export abstract class CDrop<
  TSource extends IDragSource,
  TTarget extends IDropTarget,
> implements ICDrop<TSource, TTarget>
{
  public onDrop(_context: IDragOverContext<TSource, TTarget>): void {}
}

export abstract class CDropZone<
  TSource extends IDragSource,
  TTarget extends IDropTarget,
> implements
    ICDragEnter<TSource, TTarget>,
    ICDragOver<TSource, TTarget>,
    ICDragLeave<TSource, TTarget>,
    ICDrop<TSource, TTarget>
{
  public onDragEnter(_context: IDragOverContext<TSource, TTarget>): void {}

  public onDragOver(_context: IDragOverContext<TSource, TTarget>): void {}

  public onDragLeave(_context: IDragOverContext<TSource, TTarget>): void {}

  public onDrop(_context: IDragOverContext<TSource, TTarget>): void {}
}

// ------------------------------------------------------------------------------------
// FULL PARTICIPANT STANDARD IMPLEMENTATION
// ------------------------------------------------------------------------------------

export abstract class CDragDropParticipant<
  TSource extends IDragSource,
  TTarget extends IDropTarget,
> implements ICDragDropParticipant<TSource, TTarget>
{
  public onDragStart(_context: IDragContext<TSource>): void {}

  public onDrag(_context: IDragContext<TSource>): void {}

  public onDragEnd(_context: IDragContext<TSource>): void {}

  public onDragEnter(_context: IDragOverContext<TSource, TTarget>): void {}

  public onDragOver(_context: IDragOverContext<TSource, TTarget>): void {}

  public onDragLeave(_context: IDragOverContext<TSource, TTarget>): void {}

  public onDrop(_context: IDragOverContext<TSource, TTarget>): void {}
}