export const ServiceLifetime = {
  Singleton: "Singleton",
  Scoped: "Scoped",
  Transient: "Transient",
} as const;

export type ServiceLifetime =
  (typeof ServiceLifetime)[keyof typeof ServiceLifetime];