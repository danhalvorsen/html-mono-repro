import type {
  ICommand,
  ICommandBase,
  IQuery,
  IQueryBase,
  CommandHandler,
  QueryHandler,
} from "@monorepo/core-design-patterns-cqrs-no-json";
import type {
  NonUndefined,
  Result,
} from "@monorepo/core-design-patterns";
import type {
  IServiceProvider,
  IServiceScope,
  ServiceKey,
} from "@monorepo/core-ioc-inversify/new";
import type { CommandHandlerRegistry } from "./CommandHandlerRegistry.js";
import type { QueryHandlerRegistry } from "./QueryHandlerRegistry.js";

export class IocCqrsServiceProvider implements IServiceProvider {
  public constructor(
    private readonly innerProvider: IServiceProvider,
    private readonly commandHandlerRegistry: CommandHandlerRegistry,
    private readonly queryHandlerRegistry: QueryHandlerRegistry,
  ) {}

  public GetRequiredService<TService extends object>(
    serviceType: ServiceKey<TService>,
  ): TService {
    return this.innerProvider.GetRequiredService(serviceType);
  }

  public GetService<TService extends object>(
    serviceType: ServiceKey<TService>,
  ): TService | undefined {
    return this.innerProvider.GetService(serviceType);
  }

  public CreateScope(): IServiceScope {
    return this.innerProvider.CreateScope();
  }

  public async DispatchCommand<
    TMessage extends ICommandBase,
    TResult extends NonUndefined,
    TError extends NonUndefined,
  >(
    command: ICommand<TMessage>,
  ): Promise<Result<TResult, TError>> {
    const handlerType = this.commandHandlerRegistry.Resolve(command);
    const handler = this.GetRequiredService(handlerType) as CommandHandler<
      TMessage,
      TResult,
      TError
    >;

    return handler.Handle(command);
  }

  public async DispatchQuery<
    TMessage extends IQueryBase,
    TResult extends NonUndefined,
    TError extends NonUndefined,
  >(
    query: IQuery<TMessage>,
  ): Promise<Result<TResult, TError>> {
    const handlerType = this.queryHandlerRegistry.Resolve(query);
    const handler = this.GetRequiredService(handlerType) as QueryHandler<
      TMessage,
      TResult,
      TError
    >;

    return handler.Handle(query);
  }
}