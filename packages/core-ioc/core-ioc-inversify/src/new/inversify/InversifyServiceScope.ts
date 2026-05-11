import type { IServiceProvider, IServiceScope } from "../IServiceProvider.js";

export class InversifyServiceScope implements IServiceScope {
  private isDisposed = false;

  public constructor(
    public readonly ServiceProvider: IServiceProvider,
  ) {}

  public Dispose(): void {
    this.isDisposed = true;
  }

  public get IsDisposed(): boolean {
    return this.isDisposed;
  }
}