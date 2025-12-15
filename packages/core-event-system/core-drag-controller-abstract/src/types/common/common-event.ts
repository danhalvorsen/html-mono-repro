import { EventName } from "./event-name.js";
import { TimeStamp } from "./time-stamp.js";

export interface ICommonEventData {
  readonly event: EventName;
}

export interface ICommonEvent<TData extends ICommonEventData> {
  readonly name: EventName;
  readonly timestamp: TimeStamp;
  readonly data: TData;
  dispose(): void;
}

export class CommonEvent<TData extends ICommonEventData>
  implements ICommonEvent<TData>
{
  private disposed = false;

  constructor(
    public readonly name: EventName,
    public readonly timestamp: TimeStamp,
    public readonly data: TData
  ) {}

  dispose(): void {
    if (this.disposed) return;
    (this as any).data = null;
    this.disposed = true;
  }
}

export interface ICommonEventHandler<TData extends ICommonEventData> {
  handle(evt: ICommonEvent<TData>): void | Promise<void>;
}
