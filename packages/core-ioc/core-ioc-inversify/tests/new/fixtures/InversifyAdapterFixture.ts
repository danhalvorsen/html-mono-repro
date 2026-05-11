import {
  ServiceCollection,
} from "../../../src/new/index.js";
import {
  InversifyContainerAdapter,
} from "../../../src/new/inversify/index.js";

export abstract class Slice2LoggerContract {
  public abstract Log(message: string): void;
}

export class Slice2ConsoleLogger extends Slice2LoggerContract {
  public readonly Messages: string[] = [];

  public Log(message: string): void {
    this.Messages.push(message);
  }
}

export abstract class Slice2UnitOfWorkContract {
  public abstract Commit(): void;
}

export class Slice2SqlUnitOfWork extends Slice2UnitOfWorkContract {
  public CommitCount = 0;

  public Commit(): void {
    this.CommitCount++;
  }
}

export class Slice2UserService {
  public constructor(
    public readonly Logger: Slice2LoggerContract,
  ) {}
}

export class Slice2ExplodingService {
  public readonly Value = "unused";
}

export class InversifyAdapterFixture {
  public readonly LoggerContract = Slice2LoggerContract;
  public readonly ConsoleLogger = Slice2ConsoleLogger;
  public readonly UnitOfWorkContract = Slice2UnitOfWorkContract;
  public readonly SqlUnitOfWork = Slice2SqlUnitOfWork;
  public readonly UserService = Slice2UserService;
  public readonly ExplodingService = Slice2ExplodingService;

  public createCollection(): {
    readonly Collection: ServiceCollection;
    readonly Adapter: InversifyContainerAdapter;
  } {
    const adapter = new InversifyContainerAdapter();

    return {
      Collection: new ServiceCollection({
        Adapter: adapter,
      }),
      Adapter: adapter,
    };
  }
}