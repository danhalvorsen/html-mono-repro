import {
  CreateDefaultContainerBuilder,
} from "../../../src/new/index.js";

export abstract class FacadeLoggerContract {
  public abstract Log(message: string): void;
}

export class FacadeConsoleLogger extends FacadeLoggerContract {
  public readonly Messages: string[] = [];

  public Log(message: string): void {
    this.Messages.push(message);
  }
}

export class FacadeBoundaryFixture {
  public readonly LoggerContract = FacadeLoggerContract;
  public readonly ConsoleLogger = FacadeConsoleLogger;

  public createDefaultBuilder() {
    return CreateDefaultContainerBuilder();
  }
}