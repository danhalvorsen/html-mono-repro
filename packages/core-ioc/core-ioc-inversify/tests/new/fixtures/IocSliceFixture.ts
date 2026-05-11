import {
  DuplicateRegistrationPolicy,
  type IContainerAdapter,
  type IServiceProvider,
  type IServiceScope,
  type ServiceCollectionOptions,
  type ServiceDescriptor,
  ServiceCollection,
  type ServiceKey,
} from "../../../src/new/index.js";

export abstract class LoggerContract {
  public abstract Log(message: string): void;
}

export class ConsoleLogger extends LoggerContract {
  public readonly Messages: string[] = [];

  public Log(message: string): void {
    this.Messages.push(message);
  }
}

export class FileLogger extends LoggerContract {
  public readonly Lines: string[] = [];

  public Log(message: string): void {
    this.Lines.push(message);
  }
}

export abstract class UnitOfWorkContract {
  public abstract Commit(): void;
}

export class SqlUnitOfWork extends UnitOfWorkContract {
  public Commit(): void {
    return;
  }
}

export class UserService {
  public constructor(public readonly Logger: LoggerContract) {}
}

export class RecordingServiceScope implements IServiceScope {
  public IsDisposed = false;

  public constructor(public readonly ServiceProvider: IServiceProvider) {}

  public Dispose(): void {
    this.IsDisposed = true;
  }
}

export class RecordingServiceProvider implements IServiceProvider {
  private readonly instances: Map<ServiceKey, object>;

  public constructor() {
    this.instances = new Map();
  }

  public Register<TService extends object>(
    serviceType: ServiceKey<TService>,
    instance: TService,
  ): void {
    this.instances.set(serviceType, instance);
  }

  public GetRequiredService<TService extends object>(
    serviceType: ServiceKey<TService>,
  ): TService {
    const instance = this.GetService(serviceType);

    if (instance === undefined) {
      throw new Error("Test provider could not resolve requested service.");
    }

    return instance;
  }

  public GetService<TService extends object>(
    serviceType: ServiceKey<TService>,
  ): TService | undefined {
    return this.instances.get(serviceType) as TService | undefined;
  }

  public CreateScope(): IServiceScope {
    return new RecordingServiceScope(this);
  }
}

export class RecordingContainerAdapter implements IContainerAdapter {
  public readonly RegisteredDescriptors: ServiceDescriptor[] = [];
  public readonly Provider: RecordingServiceProvider;
  public BuildProviderCallCount = 0;
  public CreateScopeCallCount = 0;
  public ResolveCallCount = 0;

  public constructor(provider: RecordingServiceProvider = new RecordingServiceProvider()) {
    this.Provider = provider;
  }

  public RegisterDescriptor(descriptor: ServiceDescriptor): void {
    this.RegisteredDescriptors.push(descriptor);
  }

  public BuildProvider(): IServiceProvider {
    this.BuildProviderCallCount++;
    return this.Provider;
  }

  public CreateScope(provider: IServiceProvider): IServiceScope {
    this.CreateScopeCallCount++;
    return provider.CreateScope();
  }

  public Resolve<TService extends object>(
    serviceType: ServiceKey<TService>,
  ): TService {
    this.ResolveCallCount++;
    return this.Provider.GetRequiredService(serviceType);
  }
}

export class IocSliceFixture {
  public readonly LoggerContract = LoggerContract;
  public readonly ConsoleLogger = ConsoleLogger;
  public readonly FileLogger = FileLogger;
  public readonly UnitOfWorkContract = UnitOfWorkContract;
  public readonly SqlUnitOfWork = SqlUnitOfWork;
  public readonly UserService = UserService;

  public createRecordingAdapter(): RecordingContainerAdapter {
    return new RecordingContainerAdapter();
  }

  public createCollection(
    adapter: RecordingContainerAdapter = this.createRecordingAdapter(),
    options: Omit<ServiceCollectionOptions, "Adapter"> = {},
  ): {
    readonly Collection: ServiceCollection;
    readonly Adapter: RecordingContainerAdapter;
  } {
    return {
      Collection: new ServiceCollection({
        Adapter: adapter,
        ...options,
      }),
      Adapter: adapter,
    };
  }

  public createCollectionRejectingDuplicates(): {
    readonly Collection: ServiceCollection;
    readonly Adapter: RecordingContainerAdapter;
  } {
    return this.createCollection(this.createRecordingAdapter(), {
      DuplicateRegistrationPolicy: DuplicateRegistrationPolicy.RejectExactDuplicates,
    });
  }

  public singleDescriptor(collection: ServiceCollection): ServiceDescriptor {
    const descriptors = collection.GetDescriptors();

    if (descriptors.length !== 1) {
      throw new Error(`Expected exactly one descriptor, got ${descriptors.length}.`);
    }

    return descriptors[0]!;
  }
}