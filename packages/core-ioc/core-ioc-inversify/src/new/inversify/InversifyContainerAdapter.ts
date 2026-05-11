import "reflect-metadata";
import { Container } from "inversify";
import { IocAdapterError } from "../errors/IocAdapterError.js";
import type { IContainerAdapter } from "../IContainerAdapter.js";
import type { IServiceProvider, IServiceScope } from "../IServiceProvider.js";
import type { ServiceDescriptor } from "../ServiceDescriptor.js";
import type { ServiceKey } from "../ServiceTypes.js";
import { InversifyDescriptorBinder } from "./InversifyDescriptorBinder.js";
import { InversifyServiceProvider } from "./InversifyServiceProvider.js";

export class InversifyContainerAdapter implements IContainerAdapter {
  private readonly descriptors: ServiceDescriptor[] = [];
  private readonly binder: InversifyDescriptorBinder;

  private rootProvider: InversifyServiceProvider | undefined;

  public constructor(
    binder: InversifyDescriptorBinder = new InversifyDescriptorBinder(),
  ) {
    this.binder = binder;
  }

  public RegisterDescriptor(descriptor: ServiceDescriptor): void {
    if (this.rootProvider !== undefined) {
      throw new IocAdapterError(
        "Cannot register descriptors after the service provider has been built.",
      );
    }

    this.descriptors.push(descriptor);
  }

  public BuildProvider(): IServiceProvider {
    if (this.rootProvider !== undefined) {
      return this.rootProvider;
    }

    try {
      const container = this.createContainer();

      let provider: InversifyServiceProvider;

      this.binder.BindDescriptors(
        container,
        this.descriptors,
        () => provider,
        undefined,
      );

      provider = new InversifyServiceProvider(
        container,
        () => this.createScopedProvider(provider),
      );

      this.rootProvider = provider;

      return provider;
    } catch {
      throw new IocAdapterError(
        "Service provider build failed while binding service descriptors.",
      );
    }
  }

  public CreateScope(provider: IServiceProvider): IServiceScope {
    return provider.CreateScope();
  }

  public Resolve<TService extends object>(
    serviceType: ServiceKey<TService>,
  ): TService {
    return this.BuildProvider().GetRequiredService(serviceType);
  }

  private createScopedProvider(
    rootProvider: IServiceProvider,
  ): IServiceProvider {
    const container = this.createContainer();

    let scopedProvider: InversifyServiceProvider;

    this.binder.BindDescriptors(
      container,
      this.descriptors,
      () => scopedProvider,
      rootProvider,
    );

    scopedProvider = new InversifyServiceProvider(
      container,
      () => this.createScopedProvider(rootProvider),
    );

    return scopedProvider;
  }

  private createContainer(): Container {
    return new Container({
      defaultScope: "Transient",
      autoBindInjectable: false,
    });
  }
}