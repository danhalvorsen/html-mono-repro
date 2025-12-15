import { ICommonEventData, ICommonEvent } from "../../types/common/index.js";
import { IActionHandler } from "../../types/common/actionHandler.js";

export namespace EventHandlers {
  export interface IEventHandler<TData extends ICommonEventData> {
    handle(evt: ICommonEvent<TData>): void | Promise<void>;
    dispose(): void;
  }

  export abstract class BaseEventHandler<TData extends ICommonEventData>
    implements IEventHandler<TData>
  {
    private disposed = false;

    constructor(protected readonly logic: IActionHandler<TData>) {}

    async handle(evt: ICommonEvent<TData>): Promise<void> {
      if (this.disposed) return;

      await this.before(evt);
      await this.logic.execute(evt.data);
      await this.after(evt);

      evt.dispose();
    }

    // Hooks for subclasses to override
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected async before(_evt: ICommonEvent<TData>): Promise<void> {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected async after(_evt: ICommonEvent<TData>): Promise<void> {}

    dispose(): void {
      this.disposed = true;
      this.onDispose();
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected onDispose(): void {}
  }
}

export type IEventHandler<TData extends ICommonEventData> =
  EventHandlers.IEventHandler<TData>;
export const BaseEventHandler = EventHandlers.BaseEventHandler;
