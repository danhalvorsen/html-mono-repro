export const ServiceRegistrationKind = {
  ImplementationType: "ImplementationType",
  Factory: "Factory",
  Instance: "Instance",
} as const;

export type ServiceRegistrationKind =
  (typeof ServiceRegistrationKind)[keyof typeof ServiceRegistrationKind];