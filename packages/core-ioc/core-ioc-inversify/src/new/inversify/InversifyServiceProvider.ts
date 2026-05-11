import type { Container } from "inversify";
import { IocResolutionError } from "../errors/IocResolutionError.js";
import type { IServiceProvider, IServiceScope } from "../IServiceProvider.js";
import {
  GetServiceKeyName,
  type ServiceKey,
} from "../ServiceTypes.js";
import { ToInversifyServiceIdentifier } from "./InversifyServiceIdentifierMapper.js";
import { InversifyServiceScope } from "./InversifyServiceScope.js";

export type InversifyScopeFactory = () => IServiceProvider;

export class InversifyServiceProvider implements IServiceProvider {
  public constructor(
    private readonly container: Container,
    private readonly createScopedProvider: InversifyScopeFactory,
  ) {}

  public GetRequiredService<TService extends object>(
    serviceType: ServiceKey<TService>,
  ): TService {
    const service = this.GetService(serviceType);

    if (service === undefined) {
      throw IocResolutionError.MissingService(GetServiceKeyName(serviceType));
    }

    return service;
  }

  public GetService<TService extends object>(
    serviceType: ServiceKey<TService>,
  ): TService | undefined {
    const identifier = ToInversifyServiceIdentifier(serviceType);

    if (!this.container.isBound(identifier)) {
      return undefined;
    }

    try {
      return this.container.get<TService>(identifier);
    } catch (error) {
      if (error instanceof IocResolutionError) {
        throw error;
      }

      throw IocResolutionError.Failed(GetServiceKeyName(serviceType));
    }
  }

  public CreateScope(): IServiceScope {
    return new InversifyServiceScope(this.createScopedProvider());
  }
}