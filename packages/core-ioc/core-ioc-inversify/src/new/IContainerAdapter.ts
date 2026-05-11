import { IocBuildError } from "./errors/IocBuildError.js";
import type { IServiceProvider, IServiceScope } from "./IServiceProvider.js";
import type { ServiceDescriptor } from "./ServiceDescriptor.js";
import type { ServiceKey } from "./ServiceTypes.js";

export interface IContainerAdapter {
  RegisterDescriptor(descriptor: ServiceDescriptor): void;

  BuildProvider(): IServiceProvider;

  CreateScope(provider: IServiceProvider): IServiceScope;

  Resolve<TService extends object>(
    serviceType: ServiceKey<TService>,
  ): TService;
}

export class MissingContainerAdapter implements IContainerAdapter {
  public RegisterDescriptor(_descriptor: ServiceDescriptor): void {
    throw new IocBuildError("No container adapter has been configured.");
  }

  public BuildProvider(): IServiceProvider {
    throw new IocBuildError("No container adapter has been configured.");
  }

  public CreateScope(_provider: IServiceProvider): IServiceScope {
    throw new IocBuildError("No container adapter has been configured.");
  }

  public Resolve<TService extends object>(
    _serviceType: ServiceKey<TService>,
  ): TService {
    throw new IocBuildError("No container adapter has been configured.");
  }
}