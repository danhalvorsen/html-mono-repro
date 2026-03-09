import { expect, test as base } from "vitest";
import { IReactiveController , ControllerHostCore, ReactiveShapeHost, IReactiveShapeController } from "../../src/index.js";

export interface IControllerCallLog {
  readonly connectedHosts: ReadonlyArray<unknown>;
  readonly disconnectedCount: number;
  readonly updateCount: number;
  readonly disposeCount: number;
}

export interface IControllerStub<THost> extends IReactiveShapeController<THost> {
  readonly log: IControllerCallLog;
}

export interface IReactiveTestFixture {
  createHostCore<THost>(
    host: THost,
  ): ControllerHostCore<THost, IReactiveController<THost>>;

  createShapeHost(): ReactiveShapeHost;

  createController<THost>(): IControllerStub<THost>;
}

class ControllerCallLog implements IControllerCallLog {
  private readonly _connectedHosts: unknown[] = [];
  private _disconnectedCount = 0;
  private _updateCount = 0;
  private _disposeCount = 0;

  public get connectedHosts(): ReadonlyArray<unknown> {
    return this._connectedHosts;
  }

  public get disconnectedCount(): number {
    return this._disconnectedCount;
  }

  public get updateCount(): number {
    return this._updateCount;
  }

  public get disposeCount(): number {
    return this._disposeCount;
  }

  public recordConnected(host: unknown): void {
    this._connectedHosts.push(host);
  }

  public recordDisconnected(): void {
    this._disconnectedCount += 1;
  }

  public recordUpdated(): void {
    this._updateCount += 1;
  }

  public recordDisposed(): void {
    this._disposeCount += 1;
  }
}

class ReactiveControllerStub<THost> implements IControllerStub<THost> {
  public readonly log = new ControllerCallLog();

  public hostConnected(host: THost): void {
    this.log.recordConnected(host);
  }

  public hostDisconnected(): void {
    this.log.recordDisconnected();
  }

  public hostUpdate(): void {
    this.log.recordUpdated();
  }

  public dispose(): void {
    this.log.recordDisposed();
  }
}

class ReactiveTestFixture implements IReactiveTestFixture {
  public createHostCore<THost>(
    host: THost,
  ): ControllerHostCore<THost, IReactiveController<THost>> {
    return new ControllerHostCore<THost, IReactiveController<THost>>(host);
  }

  public createShapeHost(): ReactiveShapeHost {
    return new ReactiveShapeHost();
  }

  public createController<THost>(): IControllerStub<THost> {
    return new ReactiveControllerStub<THost>();
  }
}

export const test = base.extend<{ fixture: IReactiveTestFixture }>({
  fixture: async ({}, use) => {
    await use(new ReactiveTestFixture());
  },
});

export { expect };