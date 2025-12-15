import { Position } from "../common/position.js";
import { ICommonEventData } from "../common/common-event.js";

export type DragDropEffect = "copy" | "move" | "link" | "none";
export type DragEffectAllowed =
  | "copy"
  | "move"
  | "link"
  | "copyLink"
  | "copyMove"
  | "linkMove"
  | "all"
  | "none"
  | "uninitialized";

export interface IDragDataTransfer {
  dropEffect?: DragDropEffect;
  effectAllowed?: DragEffectAllowed;
  types?: readonly string[];
  files?: FileList;
  getData?(type: string): string;
  setData?(type: string, value: string): void;
}

export interface IDragStartData extends ICommonEventData {
  readonly start: Position;
  readonly dataTransfer?: IDragDataTransfer;
}

export interface IDragMoveData extends ICommonEventData {
  readonly start: Position;
  readonly current: Position;
  readonly delta: Position;
  readonly dataTransfer?: IDragDataTransfer;
}

export interface IDragEndData extends ICommonEventData {
  readonly start: Position;
  readonly end: Position;
  readonly dataTransfer?: IDragDataTransfer;
}

export interface IDragEnterData extends ICommonEventData {
  readonly position?: Position;
  readonly targetId?: string;
  readonly dataTransfer?: IDragDataTransfer;
}

export interface IDragLeaveData extends ICommonEventData {
  readonly position?: Position;
  readonly targetId?: string;
  readonly dataTransfer?: IDragDataTransfer;
}

export interface IDragOverData extends ICommonEventData {
  readonly position: Position;
  readonly delta?: Position;
  readonly targetId?: string;
  readonly dataTransfer?: IDragDataTransfer;
}

export interface IDropData extends ICommonEventData {
  readonly position: Position;
  readonly targetId?: string;
  readonly payload?: unknown;
  readonly dataTransfer?: IDragDataTransfer;
}
