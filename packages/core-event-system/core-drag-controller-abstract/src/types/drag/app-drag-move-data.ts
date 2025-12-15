import { ICommonEventData } from "../common/common-event.js";

export interface AppDragMoveData extends ICommonEventData {
  readonly x: number;
  readonly y: number;
  readonly objectId: string;
}
