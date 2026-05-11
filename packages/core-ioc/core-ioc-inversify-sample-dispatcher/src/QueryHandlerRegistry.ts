import type {
  ServiceKey,
} from "@monorepo/core-ioc-inversify/new";
import {
  IocResolutionError,
} from "@monorepo/core-ioc-inversify/new";

export type RequestConstructor<TRequest extends object = object> =
  abstract new (...args: any[]) => TRequest;

export type QueryHandlerRegistration = Readonly<{
  readonly QueryType: RequestConstructor;
  readonly HandlerType: ServiceKey<object>;
}>;

export class QueryHandlerRegistry {
  private readonly handlerByQueryType: ReadonlyMap<Function, ServiceKey<object>>;

  public constructor(
    registrations: readonly QueryHandlerRegistration[],
  ) {
    this.handlerByQueryType = new Map(
      registrations.map((registration) => [
        registration.QueryType,
        registration.HandlerType,
      ]),
    );
  }

  public Resolve(query: object): ServiceKey<object> {
    const handlerType = this.handlerByQueryType.get(query.constructor);

    if (handlerType === undefined) {
      throw new IocResolutionError(
        `Query dispatch failed. No query handler is registered for query='${query.constructor.name}'.`,
      );
    }

    return handlerType;
  }
}