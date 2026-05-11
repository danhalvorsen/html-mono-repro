import {
  CreateConstructorDependencyMetadata,
  EmptyConstructorDependencyMetadata,
  type ConstructorDependencyMetadata,
} from "./ConstructorDependencyMetadata.js";
import type { ServiceKey } from "./ServiceTypes.js";

export type ServiceRegistrationOptions = Readonly<{
  readonly Dependencies?: readonly ServiceKey[];
}>;

export const EmptyServiceRegistrationOptions: NormalizedServiceRegistrationOptions =
  Object.freeze({
    ConstructorDependencies: EmptyConstructorDependencyMetadata,
  });

export type NormalizedServiceRegistrationOptions = Readonly<{
  readonly ConstructorDependencies: ConstructorDependencyMetadata;
}>;

export function IsServiceRegistrationOptions(
  value: unknown,
): value is ServiceRegistrationOptions {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return Object.prototype.hasOwnProperty.call(value, "Dependencies");
}

export function NormalizeServiceRegistrationOptions(
  options: ServiceRegistrationOptions | undefined,
): NormalizedServiceRegistrationOptions {
  if (options === undefined) {
    return EmptyServiceRegistrationOptions;
  }

  return Object.freeze({
    ConstructorDependencies: CreateConstructorDependencyMetadata(
      options.Dependencies,
    ),
  });
}