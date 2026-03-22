// ====================================================================================
// FILE: DragDropSemantics.ts
// ====================================================================================

import type { Point } from "@monorepo/core-math";

// ------------------------------------------------------------------------------------
// CORE VALUE TYPES
// ------------------------------------------------------------------------------------

export interface IDragSource {
  readonly dragSourceId: string;
}

export interface IDropTarget {
  readonly dropTargetId: string;
}

export interface IDragContext<TSource extends IDragSource> {
  readonly source: TSource;
  readonly origin: Point;
  readonly current: Point;
}

export interface IDragOverContext<
  TSource extends IDragSource,
  TTarget extends IDropTarget,
> extends IDragContext<TSource> {
  readonly target: TTarget;
}

// ------------------------------------------------------------------------------------
// HTML-ALIGNED SEMANTIC CONTRACTS
// ------------------------------------------------------------------------------------

export interface ICDragStart<TSource extends IDragSource> {
  onDragStart(context: IDragContext<TSource>): void;
}

export interface ICDrag<TSource extends IDragSource> {
  onDrag(context: IDragContext<TSource>): void;
}

export interface ICDragEnter<
  TSource extends IDragSource,
  TTarget extends IDropTarget,
> {
  onDragEnter(context: IDragOverContext<TSource, TTarget>): void;
}

export interface ICDragOver<
  TSource extends IDragSource,
  TTarget extends IDropTarget,
> {
  onDragOver(context: IDragOverContext<TSource, TTarget>): void;
}

export interface ICDragLeave<
  TSource extends IDragSource,
  TTarget extends IDropTarget,
> {
  onDragLeave(context: IDragOverContext<TSource, TTarget>): void;
}

export interface ICDrop<
  TSource extends IDragSource,
  TTarget extends IDropTarget,
> {
  onDrop(context: IDragOverContext<TSource, TTarget>): void;
}

export interface ICDragEnd<TSource extends IDragSource> {
  onDragEnd(context: IDragContext<TSource>): void;
}

// ------------------------------------------------------------------------------------
// COMPOSED CONTRACTS
// ------------------------------------------------------------------------------------

export interface ICDragSource<TSource extends IDragSource>
  extends ICDragStart<TSource>,
    ICDrag<TSource>,
    ICDragEnd<TSource> {}

export interface ICDropZone<
  TSource extends IDragSource,
  TTarget extends IDropTarget,
> extends ICDragEnter<TSource, TTarget>,
    ICDragOver<TSource, TTarget>,
    ICDragLeave<TSource, TTarget>,
    ICDrop<TSource, TTarget> {}

export interface ICDragDropParticipant<
  TSource extends IDragSource,
  TTarget extends IDropTarget,
> extends ICDragSource<TSource>,
    ICDropZone<TSource, TTarget> {}

    // ====================================================================================
// FILE: DragDropSemanticsBase.ts
// ====================================================================================
