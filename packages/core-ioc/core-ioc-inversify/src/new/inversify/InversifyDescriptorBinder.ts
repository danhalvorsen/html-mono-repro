import "reflect-metadata";
import {
  Container,
  decorate,
  injectable,
  type interfaces,
} from "inversify";
import { IocAdapterError } from "../errors/IocAdapterError.js";
import type { IServiceProvider } from "../IServiceProvider.js";
import type { ServiceDescriptor } from "../ServiceDescriptor.js";
import { ServiceLifetime } from "../ServiceLifetime.js";
import { ServiceRegistrationKind } from "../ServiceRegistrationKind.js";
import type {
  ServiceImplementationConstructor,
  ServiceKey,
} from "../ServiceTypes.js";
import { ToInversifyServiceIdentifier } from "./InversifyServiceIdentifierMapper.js";

export type ProviderAccessor = () => IServiceProvider;

export class InversifyDescriptorBinder {
  private readonly decoratedConstructors = new WeakSet<Function>();

  public BindDescriptors(
    container: Container,
    descriptors: readonly ServiceDescriptor[],
    currentProvider: ProviderAccessor,
    rootProvider: IServiceProvider | undefined,
  ): void {
    for (const descriptor of descriptors) {
      this.BindDescriptor(container, descriptor, currentProvider, rootProvider);
    }
  }

  public BindDescriptor(
    container: Container,
    descriptor: ServiceDescriptor,
    currentProvider: ProviderAccessor,
    rootProvider: IServiceProvider | undefined,
  ): void {
    if (
      rootProvider !== undefined &&
      descriptor.Lifetime === ServiceLifetime.Singleton
    ) {
      this.bindSingletonDelegation(container, descriptor.ServiceType, rootProvider);
      return;
    }

    switch (descriptor.RegistrationKind) {
      case ServiceRegistrationKind.ImplementationType:
        this.bindImplementation(container, descriptor, currentProvider);
        return;

      case ServiceRegistrationKind.Factory:
        this.bindFactory(container, descriptor, currentProvider);
        return;

      case ServiceRegistrationKind.Instance:
        this.bindInstance(container, descriptor);
        return;

      default:
        throw new IocAdapterError(
          `Unsupported registration kind for descriptor '${descriptor.Id.Value}'.`,
        );
    }
  }

  private bindImplementation(
    container: Container,
    descriptor: ServiceDescriptor,
    currentProvider: ProviderAccessor,
  ): void {
    const implementationType = descriptor.ImplementationType;

    if (implementationType === undefined) {
      throw new IocAdapterError(
        `Descriptor '${descriptor.Id.Value}' is missing an implementation type.`,
      );
    }

    const identifier = ToInversifyServiceIdentifier(descriptor.ServiceType);
    const dependencyKeys = descriptor.ConstructorDependencies.Dependencies;

    if (dependencyKeys.length > 0) {
      const binding = container
        .bind(identifier)
        .toDynamicValue(() => {
          const provider = currentProvider();
          const dependencies = dependencyKeys.map((dependency) =>
            provider.GetRequiredService(dependency),
          );

          return new implementationType(...dependencies);
        });

      this.applyLifetime(binding, descriptor.Lifetime);
      return;
    }

    this.ensureInjectable(implementationType);

    const binding = container
      .bind(identifier)
      .to(implementationType as never);

    this.applyLifetime(binding, descriptor.Lifetime);
  }

  private bindFactory(
    container: Container,
    descriptor: ServiceDescriptor,
    currentProvider: ProviderAccessor,
  ): void {
    const factory = descriptor.ImplementationFactory;

    if (factory === undefined) {
      throw new IocAdapterError(
        `Descriptor '${descriptor.Id.Value}' is missing an implementation factory.`,
      );
    }

    const identifier = ToInversifyServiceIdentifier(descriptor.ServiceType);
    const binding = container
      .bind(identifier)
      .toDynamicValue(() => factory(currentProvider()));

    this.applyLifetime(binding, descriptor.Lifetime);
  }

  private bindInstance(
    container: Container,
    descriptor: ServiceDescriptor,
  ): void {
    if (descriptor.ImplementationInstance === undefined) {
      throw new IocAdapterError(
        `Descriptor '${descriptor.Id.Value}' is missing an implementation instance.`,
      );
    }

    const identifier = ToInversifyServiceIdentifier(descriptor.ServiceType);

    container
      .bind(identifier)
      .toConstantValue(descriptor.ImplementationInstance);
  }

  private bindSingletonDelegation<TService extends object>(
    container: Container,
    serviceType: ServiceKey<TService>,
    rootProvider: IServiceProvider,
  ): void {
    const identifier = ToInversifyServiceIdentifier(serviceType);

    container
      .bind(identifier)
      .toDynamicValue(() => rootProvider.GetRequiredService(serviceType))
      .inTransientScope();
  }

  private applyLifetime(
    binding: interfaces.BindingInWhenOnSyntax<unknown>,
    lifetime: ServiceLifetime,
  ): void {
    switch (lifetime) {
      case ServiceLifetime.Singleton:
        binding.inSingletonScope();
        return;

      case ServiceLifetime.Scoped:
        binding.inSingletonScope();
        return;

      case ServiceLifetime.Transient:
      default:
        binding.inTransientScope();
        return;
    }
  }

  private ensureInjectable(
    implementationType: ServiceImplementationConstructor,
  ): void {
    if (this.decoratedConstructors.has(implementationType)) {
      return;
    }

    try {
      decorate(injectable(), implementationType);
      this.decoratedConstructors.add(implementationType);
    } catch {
      this.decoratedConstructors.add(implementationType);
    }
  }
}