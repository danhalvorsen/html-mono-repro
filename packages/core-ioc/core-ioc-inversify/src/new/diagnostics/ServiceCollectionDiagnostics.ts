import {
  GetDescriptorMetadata,
  type ServiceDescriptor,
} from "../ServiceDescriptor.js";
import type { ServiceCollection } from "../ServiceCollection.js";

export type ServiceDescriptorDiagnostic = Readonly<{
  readonly InternalDescriptorIdentity: string;
  readonly CollisionIndex: number;
  readonly IdentitySource: string;
  readonly Order: number;
  readonly ServiceName: string;
  readonly ImplementationName: string;
  readonly Lifetime: string;
  readonly RegistrationKind: string;
}>;

export type ServiceCollectionDiagnostics = Readonly<{
  readonly IsFrozen: boolean;
  readonly DescriptorCount: number;
  readonly Descriptors: readonly ServiceDescriptorDiagnostic[];
}>;

export interface IServiceCollectionDiagnosticsReader {
  Read(collection: ServiceCollection): ServiceCollectionDiagnostics;
}

export class ServiceCollectionDiagnosticsReader
  implements IServiceCollectionDiagnosticsReader {
  public Read(collection: ServiceCollection): ServiceCollectionDiagnostics {
    const descriptors = collection.GetDescriptors();

    return Object.freeze({
      IsFrozen: collection.IsFrozen,
      DescriptorCount: descriptors.length,
      Descriptors: Object.freeze(
        descriptors.map((descriptor) => this.createDescriptorDiagnostic(descriptor)),
      ),
    });
  }

  private createDescriptorDiagnostic(
    descriptor: ServiceDescriptor,
  ): ServiceDescriptorDiagnostic {
    const metadata = GetDescriptorMetadata(descriptor);

    return Object.freeze({
      InternalDescriptorIdentity: descriptor.Id.Value,
      CollisionIndex: descriptor.Id.CollisionIndex,
      IdentitySource: descriptor.Id.Source,
      Order: descriptor.Order,
      ServiceName: metadata.ServiceName,
      ImplementationName: metadata.ImplementationName,
      Lifetime: metadata.Lifetime,
      RegistrationKind: metadata.RegistrationKind,
    });
  }
}

export function CreateServiceCollectionDiagnostics(
  collection: ServiceCollection,
): ServiceCollectionDiagnostics {
  return new ServiceCollectionDiagnosticsReader().Read(collection);
}