import type {
  IServiceProvider,
  ServiceKey,
} from "../../../src/new/index.js";
import {
  CreateDefaultContainerBuilder,
} from "../../../src/new/index.js";

export interface IRequest<TResponse extends object> {
  readonly __response?: TResponse;
}

export interface ICommand<TResponse extends object> extends IRequest<TResponse> {}

export interface IQuery<TResponse extends object> extends IRequest<TResponse> {}

export abstract class IRequestHandler<
  TRequest extends IRequest<TResponse>,
  TResponse extends object,
> {
  public abstract Handle(request: TRequest): Promise<TResponse>;
}

export type RequestConstructor<TRequest extends IRequest<object>> =
  new (...args: never[]) => TRequest;

export type HandlerRegistration<
  TRequest extends IRequest<TResponse>,
  TResponse extends object,
> = Readonly<{
  readonly RequestType: RequestConstructor<TRequest>;
  readonly HandlerType: ServiceKey<IRequestHandler<TRequest, TResponse>>;
}>;

export class RequestHandlerRegistry {
  private readonly handlerByRequestType: Map<Function, ServiceKey>;

  public constructor(
    registrations: readonly HandlerRegistration<IRequest<object>, object>[],
  ) {
    this.handlerByRequestType = new Map(
      registrations.map((registration) => [
        registration.RequestType,
        registration.HandlerType,
      ]),
    );
  }

  public Resolve<TRequest extends IRequest<TResponse>, TResponse extends object>(
    request: TRequest,
  ): ServiceKey<IRequestHandler<TRequest, TResponse>> {
    const handlerType = this.handlerByRequestType.get(request.constructor);

    if (handlerType === undefined) {
      throw new Error(
        `No handler registered for request type '${request.constructor.name}'.`,
      );
    }

    return handlerType as ServiceKey<IRequestHandler<TRequest, TResponse>>;
  }
}

export class IocRequestDispatcher {
  public constructor(
    private readonly provider: IServiceProvider,
    private readonly registry: RequestHandlerRegistry,
  ) {}

  public async Dispatch<TResponse extends object>(
    request: IRequest<TResponse>,
  ): Promise<TResponse> {
    const handlerType = this.registry.Resolve(request);
    const handler = this.provider.GetRequiredService(handlerType);

    return handler.Handle(request as never) as Promise<TResponse>;
  }
}

export type FooCommandResult = Readonly<{
  readonly Value: number;
  readonly HandlerInstanceId: number;
  readonly Message: string;
}>;

export type BlaQueryResult = Readonly<{
  readonly Name: string;
  readonly HandlerInstanceId: number;
  readonly Message: string;
}>;

export class FooCommand implements ICommand<FooCommandResult> {
  public constructor(public readonly Value: number) {}
}

export class BlaQuery implements IQuery<BlaQueryResult> {
  public constructor(public readonly Name: string) {}
}

export abstract class FooCommandHandlerContract extends IRequestHandler<
  FooCommand,
  FooCommandResult
> {}

export abstract class BlaQueryHandlerContract extends IRequestHandler<
  BlaQuery,
  BlaQueryResult
> {}

export class HandlerInstanceSequence {
  private value = 0;

  public Next(): number {
    this.value++;
    return this.value;
  }
}

export class FooCommandHandler extends FooCommandHandlerContract {
  private readonly handlerInstanceId: number;

  public constructor(sequence: HandlerInstanceSequence) {
    super();
    this.handlerInstanceId = sequence.Next();
  }

  public async Handle(command: FooCommand): Promise<FooCommandResult> {
    return Object.freeze({
      Value: command.Value + 1,
      HandlerInstanceId: this.handlerInstanceId,
      Message: `Foo:${command.Value}`,
    });
  }
}

export class BlaQueryHandler extends BlaQueryHandlerContract {
  private readonly handlerInstanceId: number;

  public constructor(sequence: HandlerInstanceSequence) {
    super();
    this.handlerInstanceId = sequence.Next();
  }

  public async Handle(query: BlaQuery): Promise<BlaQueryResult> {
    return Object.freeze({
      Name: query.Name.toUpperCase(),
      HandlerInstanceId: this.handlerInstanceId,
      Message: `Bla:${query.Name}`,
    });
  }
}

export class CqrsIocDispatcherFixture {
  public createSystem(): {
    readonly Provider: IServiceProvider;
    readonly Dispatcher: IocRequestDispatcher;
    readonly Registry: RequestHandlerRegistry;
  } {
    const builder = CreateDefaultContainerBuilder();
    const sequence = new HandlerInstanceSequence();

    builder.Services.AddSingletonInstance(HandlerInstanceSequence, sequence);

    builder.Services.AddTransient(
      FooCommandHandlerContract,
      FooCommandHandler,
      {
        Dependencies: [HandlerInstanceSequence],
      },
    );

    builder.Services.AddTransient(
      BlaQueryHandlerContract,
      BlaQueryHandler,
      {
        Dependencies: [HandlerInstanceSequence],
      },
    );

    const registry = new RequestHandlerRegistry([
      {
        RequestType: FooCommand,
        HandlerType: FooCommandHandlerContract,
      },
      {
        RequestType: BlaQuery,
        HandlerType: BlaQueryHandlerContract,
      },
    ]);

    const provider = builder.Services.BuildServiceProvider();

    return {
      Provider: provider,
      Registry: registry,
      Dispatcher: new IocRequestDispatcher(provider, registry),
    };
  }
}