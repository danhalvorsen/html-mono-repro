import type { ServiceKey } from "./ServiceTypes.js";

export interface IServiceProvider {
  GetRequiredService<TService extends object>(
    serviceType: ServiceKey<TService>,
  ): TService;

  GetService<TService extends object>(
    serviceType: ServiceKey<TService>,
  ): TService | undefined;

  CreateScope(): IServiceScope;
}

export interface IServiceScope {
  readonly ServiceProvider: IServiceProvider;

  Dispose(): void;
}