import type { ConstructorDependencyMetadata } from "./ConstructorDependencyMetadata.js";
import type { DescriptorIdentity } from "./DescriptorIdentity.js";
import type { ServiceLifetime } from "./ServiceLifetime.js";
import type { ServiceRegistrationKind } from "./ServiceRegistrationKind.js";
import {
  GetImplementationName,
  GetServiceKeyName,
  type ServiceFactory,
  type ServiceImplementationConstructor,
  type ServiceKey,
} from "./ServiceTypes.js";

export type ServiceDescriptor<TService extends object = object> = Readonly<{
  readonly Id: DescriptorIdentity;
  readonly Order: number;
  readonly ServiceType: ServiceKey<TService>;
  readonly Lifetime: ServiceLifetime;
  readonly RegistrationKind: ServiceRegistrationKind;
  readonly ConstructorDependencies: ConstructorDependencyMetadata;
  readonly ImplementationType?: ServiceImplementationConstructor<TService>;
  readonly ImplementationFactory?: ServiceFactory<TService>;
  readonly ImplementationInstance?: TService;
}>;

export type ServiceDescriptorMetadata = {
  readonly ServiceName: string;
  readonly ImplementationName: string;
  readonly Lifetime: ServiceLifetime;
  readonly RegistrationKind: ServiceRegistrationKind;
};

export function CreateServiceDescriptor<TService extends object>(
  descriptor: ServiceDescriptor<TService>,
): ServiceDescriptor<TService> {
  return Object.freeze({
    ...descriptor,
    ConstructorDependencies: Object.freeze({
      Dependencies: Object.freeze([
        ...descriptor.ConstructorDependencies.Dependencies,
      ]),
    }),
  });
}

export function GetDescriptorMetadata(
  descriptor: ServiceDescriptor,
): ServiceDescriptorMetadata {
  return Object.freeze({
    ServiceName: GetServiceKeyName(descriptor.ServiceType),
    ImplementationName: GetDescriptorImplementationName(descriptor),
    Lifetime: descriptor.Lifetime,
    RegistrationKind: descriptor.RegistrationKind,
  });
}

export function GetDescriptorImplementationName(
  descriptor: ServiceDescriptor,
): string {
  if (descriptor.ImplementationType !== undefined) {
    return GetImplementationName(descriptor.ImplementationType);
  }

  if (descriptor.ImplementationFactory !== undefined) {
    return GetImplementationName(descriptor.ImplementationFactory);
  }

  if (descriptor.ImplementationInstance !== undefined) {
    return GetImplementationName(descriptor.ImplementationInstance);
  }

  return "[unknown]";
}

export function CreateDescriptorFingerprint(
  metadata: ServiceDescriptorMetadata,
): string {
  return [
    metadata.ServiceName,
    metadata.ImplementationName,
    metadata.Lifetime,
    metadata.RegistrationKind,
  ].join("|");
}