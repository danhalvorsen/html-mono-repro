import {
  AssertServiceKey,
  GetServiceKeyName,
  type ServiceKey,
} from "./ServiceTypes.js";

export type ConstructorDependencyMetadata = Readonly<{
  readonly Dependencies: readonly ServiceKey[];
}>;

export const EmptyConstructorDependencyMetadata: ConstructorDependencyMetadata =
  Object.freeze({
    Dependencies: Object.freeze([]),
  });

export function CreateConstructorDependencyMetadata(
  dependencies: readonly ServiceKey[] | undefined,
): ConstructorDependencyMetadata {
  if (dependencies === undefined || dependencies.length === 0) {
    return EmptyConstructorDependencyMetadata;
  }

  for (const dependency of dependencies) {
    AssertServiceKey(dependency);
  }

  return Object.freeze({
    Dependencies: Object.freeze([...dependencies]),
  });
}

export function DescribeConstructorDependencies(
  metadata: ConstructorDependencyMetadata,
): readonly string[] {
  return Object.freeze(
    metadata.Dependencies.map((dependency) => GetServiceKeyName(dependency)),
  );
}