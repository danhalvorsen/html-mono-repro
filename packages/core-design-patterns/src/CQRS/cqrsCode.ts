// MonoRepro/packages/core-design-patterns/src/CQRS/code.ts
import type { Result, NonUndefined } from "../functional/result/result.js";

export type IPayload = NonUndefined;

export interface ICqrsMessage<TPayload extends IPayload> {
  readonly name: string;
  readonly payload: TPayload;
}

export interface ICommand<TPayload extends IPayload> extends ICqrsMessage<TPayload> {}

export interface IQuery<TPayload extends IPayload> extends ICqrsMessage<TPayload> {}

export interface INotification<TPayload extends IPayload> extends ICqrsMessage<TPayload> {}

export abstract class CommandHandler<
  TCommand extends ICommand<any>,
  TResult extends NonUndefined,
  TError extends NonUndefined
> {
  public abstract handle(command: TCommand): Promise<Result<TResult, TError>>;
}

export abstract class QueryHandler<
  TQuery extends IQuery<any>,
  TResult extends NonUndefined,
  TError extends NonUndefined
> {
  public abstract handle(query: TQuery): Promise<Result<TResult, TError>>;
}

export abstract class NotificationHandler<
  TNotification extends INotification<any>
> {
  public abstract handle(notification: TNotification): void | Promise<void>;
}