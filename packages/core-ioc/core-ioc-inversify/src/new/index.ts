export { CreateContainerBuilder } from "./CreateContainerBuilder.js";

export {
  DuplicateRegistrationPolicy,
  type DuplicateRegistrationPolicy as DuplicateRegistrationPolicyValue,
} from "./DuplicateRegistrationPolicy.js";

export { DescriptorIdentity } from "./DescriptorIdentity.js";

export {
  XorDescriptorIdentityGenerator,
  type DescriptorIdentitySource,
  type IDescriptorIdentityGenerator,
} from "./DescriptorIdentityGenerator.js";

export {
  IocBuildError,
} from "./errors/IocBuildError.js";
export {
  IocCollectionFrozenError,
} from "./errors/IocCollectionFrozenError.js";
export {
  IocDuplicateDescriptorError,
} from "./errors/IocDuplicateDescriptorError.js";
export {
  IocError,
} from "./errors/IocError.js";
export {
  IocInvalidRegistrationError,
} from "./errors/IocInvalidRegistrationError.js";
export {
  IocInvalidServiceIdentityError,
} from "./errors/IocInvalidServiceIdentityError.js";

export {
  MissingContainerAdapter,
  type IContainerAdapter,
} from "./IContainerAdapter.js";

export type {
  IServiceProvider,
  IServiceScope,
} from "./IServiceProvider.js";

export {
  CreateDescriptorFingerprint,
  CreateServiceDescriptor,
  GetDescriptorImplementationName,
  GetDescriptorMetadata,
  type ServiceDescriptor,
  type ServiceDescriptorMetadata,
} from "./ServiceDescriptor.js";

export {
  ServiceCollection,
  type ServiceCollectionOptions,
} from "./ServiceCollection.js";

export {
  ServiceLifetime,
  type ServiceLifetime as ServiceLifetimeValue,
} from "./ServiceLifetime.js";

export {
  ServiceRegistrationKind,
  type ServiceRegistrationKind as ServiceRegistrationKindValue,
} from "./ServiceRegistrationKind.js";

export {
  AssertServiceKey,
  CreateServiceIdentity,
  GetImplementationName,
  GetServiceKeyName,
  IsImplementationConstructor,
  IsRuntimeConstructor,
  IsServiceIdentity,
  ServiceIdentityKind,
  type IServiceIdentity,
  type ServiceConstructor,
  type ServiceFactory,
  type ServiceImplementationConstructor,
  type ServiceKey,
} from "./ServiceTypes.js";
export { IocAdapterError } from "./errors/IocAdapterError.js";
export { IocResolutionError } from "./errors/IocResolutionError.js";
export { CreateDefaultContainerBuilder } from "./CreateDefaultContainerBuilder.js";
export { CreateServiceCollectionDiagnostics, ServiceCollectionDiagnosticsReader, type IServiceCollectionDiagnosticsReader, type ServiceCollectionDiagnostics, type ServiceDescriptorDiagnostic } from "./diagnostics/index.js";
export { CreateConstructorDependencyMetadata, DescribeConstructorDependencies, EmptyConstructorDependencyMetadata, type ConstructorDependencyMetadata } from "./ConstructorDependencyMetadata.js";
export { EmptyServiceRegistrationOptions, IsServiceRegistrationOptions, NormalizeServiceRegistrationOptions, type NormalizedServiceRegistrationOptions, type ServiceRegistrationOptions } from "./ServiceRegistrationOptions.js";