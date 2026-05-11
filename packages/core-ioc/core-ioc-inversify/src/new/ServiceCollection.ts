import { DescriptorIdentity } from "./DescriptorIdentity.js";
import {
  type IDescriptorIdentityGenerator,
  XorDescriptorIdentityGenerator,
} from "./DescriptorIdentityGenerator.js";
import { DuplicateRegistrationPolicy } from "./DuplicateRegistrationPolicy.js";
import { IocCollectionFrozenError } from "./errors/IocCollectionFrozenError.js";
import { IocDuplicateDescriptorError } from "./errors/IocDuplicateDescriptorError.js";
import { IocInvalidRegistrationError } from "./errors/IocInvalidRegistrationError.js";
import {
  type IContainerAdapter,
  MissingContainerAdapter,
} from "./IContainerAdapter.js";
import type { IServiceProvider } from "./IServiceProvider.js";
import {
  CreateDescriptorFingerprint,
  CreateServiceDescriptor,
  GetDescriptorMetadata,
  type ServiceDescriptor,
} from "./ServiceDescriptor.js";
import { ServiceLifetime } from "./ServiceLifetime.js";
import {
  IsServiceRegistrationOptions,
  NormalizeServiceRegistrationOptions,
  type ServiceRegistrationOptions,
} from "./ServiceRegistrationOptions.js";
import { ServiceRegistrationKind } from "./ServiceRegistrationKind.js";
import {
  AssertServiceKey,
  GetImplementationName,
  GetServiceKeyName,
  IsImplementationConstructor,
  IsRuntimeConstructor,
  type ServiceFactory,
  type ServiceImplementationConstructor,
  type ServiceKey,
} from "./ServiceTypes.js";

export type ServiceCollectionOptions = {
  readonly Adapter?: IContainerAdapter;
  readonly IdentityGenerator?: IDescriptorIdentityGenerator;
  readonly DuplicateRegistrationPolicy?: DuplicateRegistrationPolicy;
};

type DescriptorIdentityMetadata = {
  readonly ServiceName: string;
  readonly ImplementationName: string;
  readonly Lifetime: ServiceLifetime;
  readonly RegistrationKind: ServiceRegistrationKind;
};

export class ServiceCollection {
  private readonly adapter: IContainerAdapter;
  private readonly identityGenerator: IDescriptorIdentityGenerator;
  private readonly duplicateRegistrationPolicy: DuplicateRegistrationPolicy;
  private readonly descriptors: ServiceDescriptor[];
  private readonly descriptorFingerprints: Set<string>;
  private readonly reservedIdentityValues: Set<string>;

  private isFrozen: boolean;
  private builtProvider: IServiceProvider | undefined;
  private nextOrder: number;

  public constructor(options: ServiceCollectionOptions = {}) {
    this.adapter = options.Adapter ?? new MissingContainerAdapter();
    this.identityGenerator =
      options.IdentityGenerator ?? new XorDescriptorIdentityGenerator();
    this.duplicateRegistrationPolicy =
      options.DuplicateRegistrationPolicy ?? DuplicateRegistrationPolicy.Allow;
    this.descriptors = [];
    this.descriptorFingerprints = new Set();
    this.reservedIdentityValues = new Set();
    this.isFrozen = false;
    this.nextOrder = 0;
  }

  public AddSingleton<TService extends object>(
    serviceType: ServiceKey<TService>,
    options?: ServiceRegistrationOptions,
  ): this;
  public AddSingleton<TService extends object>(
    serviceType: ServiceKey<TService>,
    implementationType: ServiceImplementationConstructor<TService>,
    options?: ServiceRegistrationOptions,
  ): this;
  public AddSingleton<TService extends object>(
    serviceType: ServiceKey<TService>,
    implementationFactory: ServiceFactory<TService>,
  ): this;
  public AddSingleton<TService extends object>(
    serviceType: ServiceKey<TService>,
    implementationOrFactoryOrOptions?:
      | ServiceImplementationConstructor<TService>
      | ServiceFactory<TService>
      | ServiceRegistrationOptions,
    options?: ServiceRegistrationOptions,
  ): this {
    return this.addTypeOrFactory(
      ServiceLifetime.Singleton,
      serviceType,
      implementationOrFactoryOrOptions,
      options,
    );
  }

  public AddSingletonInstance<TService extends object>(
    serviceType: ServiceKey<TService>,
    instance: TService,
  ): this {
    return this.addInstance(ServiceLifetime.Singleton, serviceType, instance);
  }

  public AddScoped<TService extends object>(
    serviceType: ServiceKey<TService>,
    options?: ServiceRegistrationOptions,
  ): this;
  public AddScoped<TService extends object>(
    serviceType: ServiceKey<TService>,
    implementationType: ServiceImplementationConstructor<TService>,
    options?: ServiceRegistrationOptions,
  ): this;
  public AddScoped<TService extends object>(
    serviceType: ServiceKey<TService>,
    implementationFactory: ServiceFactory<TService>,
  ): this;
  public AddScoped<TService extends object>(
    serviceType: ServiceKey<TService>,
    implementationOrFactoryOrOptions?:
      | ServiceImplementationConstructor<TService>
      | ServiceFactory<TService>
      | ServiceRegistrationOptions,
    options?: ServiceRegistrationOptions,
  ): this {
    return this.addTypeOrFactory(
      ServiceLifetime.Scoped,
      serviceType,
      implementationOrFactoryOrOptions,
      options,
    );
  }

  public AddTransient<TService extends object>(
    serviceType: ServiceKey<TService>,
    options?: ServiceRegistrationOptions,
  ): this;
  public AddTransient<TService extends object>(
    serviceType: ServiceKey<TService>,
    implementationType: ServiceImplementationConstructor<TService>,
    options?: ServiceRegistrationOptions,
  ): this;
  public AddTransient<TService extends object>(
    serviceType: ServiceKey<TService>,
    implementationFactory: ServiceFactory<TService>,
  ): this;
  public AddTransient<TService extends object>(
    serviceType: ServiceKey<TService>,
    implementationOrFactoryOrOptions?:
      | ServiceImplementationConstructor<TService>
      | ServiceFactory<TService>
      | ServiceRegistrationOptions,
    options?: ServiceRegistrationOptions,
  ): this {
    return this.addTypeOrFactory(
      ServiceLifetime.Transient,
      serviceType,
      implementationOrFactoryOrOptions,
      options,
    );
  }

  public BuildServiceProvider(): IServiceProvider {
    if (this.builtProvider !== undefined) {
      return this.builtProvider;
    }

    for (const descriptor of this.descriptors) {
      this.adapter.RegisterDescriptor(descriptor);
    }

    const provider = this.adapter.BuildProvider();

    this.isFrozen = true;
    this.builtProvider = provider;

    return provider;
  }

  public GetDescriptors(): readonly ServiceDescriptor[] {
    return Object.freeze([...this.descriptors]);
  }

  public get IsFrozen(): boolean {
    return this.isFrozen;
  }

  private addTypeOrFactory<TService extends object>(
    lifetime: ServiceLifetime,
    serviceType: ServiceKey<TService>,
    implementationOrFactoryOrOptions:
      | ServiceImplementationConstructor<TService>
      | ServiceFactory<TService>
      | ServiceRegistrationOptions
      | undefined,
    options: ServiceRegistrationOptions | undefined,
  ): this {
    this.assertCanMutate();
    AssertServiceKey(serviceType);

    if (IsServiceRegistrationOptions(implementationOrFactoryOrOptions)) {
      if (!IsRuntimeConstructor(serviceType)) {
        throw new IocInvalidRegistrationError(
          "A strongly typed runtime identity requires an implementation type or factory.",
        );
      }

      return this.addImplementation(
        lifetime,
        serviceType,
        serviceType as ServiceImplementationConstructor<TService>,
        implementationOrFactoryOrOptions,
      );
    }

    if (implementationOrFactoryOrOptions === undefined) {
      if (!IsRuntimeConstructor(serviceType)) {
        throw new IocInvalidRegistrationError(
          "A strongly typed runtime identity requires an implementation type or factory.",
        );
      }

      return this.addImplementation(
        lifetime,
        serviceType,
        serviceType as ServiceImplementationConstructor<TService>,
        options,
      );
    }

    if (IsImplementationConstructor(implementationOrFactoryOrOptions)) {
      return this.addImplementation(
        lifetime,
        serviceType,
        implementationOrFactoryOrOptions,
        options,
      );
    }

    return this.addFactory(
      lifetime,
      serviceType,
      implementationOrFactoryOrOptions,
    );
  }

  private addImplementation<TService extends object>(
    lifetime: ServiceLifetime,
    serviceType: ServiceKey<TService>,
    implementationType: ServiceImplementationConstructor<TService>,
    options: ServiceRegistrationOptions | undefined,
  ): this {
    const normalizedOptions = NormalizeServiceRegistrationOptions(options);

    const metadata: DescriptorIdentityMetadata = Object.freeze({
      ServiceName: GetServiceKeyName(serviceType),
      ImplementationName: GetImplementationName(implementationType),
      Lifetime: lifetime,
      RegistrationKind: ServiceRegistrationKind.ImplementationType,
    });

    const descriptor = CreateServiceDescriptor<TService>({
      Id: this.createIdentity(metadata),
      Order: this.nextOrder++,
      ServiceType: serviceType,
      Lifetime: lifetime,
      RegistrationKind: ServiceRegistrationKind.ImplementationType,
      ConstructorDependencies: normalizedOptions.ConstructorDependencies,
      ImplementationType: implementationType,
    });

    this.addDescriptor(descriptor);

    return this;
  }

  private addFactory<TService extends object>(
    lifetime: ServiceLifetime,
    serviceType: ServiceKey<TService>,
    implementationFactory: ServiceFactory<TService>,
  ): this {
    const metadata: DescriptorIdentityMetadata = Object.freeze({
      ServiceName: GetServiceKeyName(serviceType),
      ImplementationName: GetImplementationName(implementationFactory),
      Lifetime: lifetime,
      RegistrationKind: ServiceRegistrationKind.Factory,
    });

    const normalizedOptions = NormalizeServiceRegistrationOptions(undefined);

    const descriptor = CreateServiceDescriptor<TService>({
      Id: this.createIdentity(metadata),
      Order: this.nextOrder++,
      ServiceType: serviceType,
      Lifetime: lifetime,
      RegistrationKind: ServiceRegistrationKind.Factory,
      ConstructorDependencies: normalizedOptions.ConstructorDependencies,
      ImplementationFactory: implementationFactory,
    });

    this.addDescriptor(descriptor);

    return this;
  }

  private addInstance<TService extends object>(
    lifetime: ServiceLifetime,
    serviceType: ServiceKey<TService>,
    instance: TService,
  ): this {
    this.assertCanMutate();
    AssertServiceKey(serviceType);

    const metadata: DescriptorIdentityMetadata = Object.freeze({
      ServiceName: GetServiceKeyName(serviceType),
      ImplementationName: GetImplementationName(instance),
      Lifetime: lifetime,
      RegistrationKind: ServiceRegistrationKind.Instance,
    });

    const normalizedOptions = NormalizeServiceRegistrationOptions(undefined);

    const descriptor = CreateServiceDescriptor<TService>({
      Id: this.createIdentity(metadata),
      Order: this.nextOrder++,
      ServiceType: serviceType,
      Lifetime: lifetime,
      RegistrationKind: ServiceRegistrationKind.Instance,
      ConstructorDependencies: normalizedOptions.ConstructorDependencies,
      ImplementationInstance: instance,
    });

    this.addDescriptor(descriptor);

    return this;
  }

  private addDescriptor(descriptor: ServiceDescriptor): void {
    const metadata = GetDescriptorMetadata(descriptor);
    const fingerprint = CreateDescriptorFingerprint(metadata);

    if (
      this.duplicateRegistrationPolicy ===
        DuplicateRegistrationPolicy.RejectExactDuplicates &&
      this.descriptorFingerprints.has(fingerprint)
    ) {
      throw new IocDuplicateDescriptorError(
        metadata.ServiceName,
        metadata.ImplementationName,
        metadata.Lifetime,
      );
    }

    this.descriptorFingerprints.add(fingerprint);
    this.descriptors.push(descriptor);
  }

  private createIdentity(
    metadata: DescriptorIdentityMetadata,
  ): DescriptorIdentity {
    const identity = this.identityGenerator.Generate(
      metadata,
      (candidate) => this.reservedIdentityValues.has(candidate),
    );

    this.reservedIdentityValues.add(identity.Value);

    return identity;
  }

  private assertCanMutate(): void {
    if (this.isFrozen) {
      throw new IocCollectionFrozenError();
    }
  }
}