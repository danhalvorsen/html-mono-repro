import { IocInvalidServiceIdentityError } from "./errors/IocInvalidServiceIdentityError.js";
import type { IServiceProvider } from "./IServiceProvider.js";

export type ServiceConstructor<TService extends object = object> =
  abstract new (...args: any[]) => TService;

export type ServiceImplementationConstructor<TService extends object = object> =
  new (...args: any[]) => TService;

export type ServiceFactory<TService extends object = object> =
  (provider: IServiceProvider) => TService;

export const ServiceIdentityKind = {
  SymbolBacked: "SymbolBacked",
} as const;

export type ServiceIdentityKind =
  (typeof ServiceIdentityKind)[keyof typeof ServiceIdentityKind];

export interface IServiceIdentity<TService extends object = object> {
  readonly Kind: typeof ServiceIdentityKind.SymbolBacked;
  readonly Symbol: symbol;
  readonly DisplayName: string;
  readonly __serviceBrand?: TService;
}

export type ServiceKey<TService extends object = object> =
  | ServiceConstructor<TService>
  | IServiceIdentity<TService>;

export function CreateServiceIdentity<TService extends object>(
  displayName: string,
): IServiceIdentity<TService> {
  if (displayName.trim().length === 0) {
    throw new IocInvalidServiceIdentityError();
  }

  return Object.freeze({
    Kind: ServiceIdentityKind.SymbolBacked,
    Symbol: Symbol(displayName),
    DisplayName: displayName,
  });
}

export function AssertServiceKey(value: unknown): asserts value is ServiceKey {
  if (typeof value === "function") {
    return;
  }

  if (IsServiceIdentity(value)) {
    return;
  }

  throw new IocInvalidServiceIdentityError();
}

export function IsServiceIdentity(value: unknown): value is IServiceIdentity {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<IServiceIdentity>;

  return (
    candidate.Kind === ServiceIdentityKind.SymbolBacked &&
    typeof candidate.Symbol === "symbol" &&
    typeof candidate.DisplayName === "string" &&
    candidate.DisplayName.length > 0
  );
}

export function IsRuntimeConstructor(
  value: unknown,
): value is ServiceConstructor {
  return typeof value === "function";
}

export function IsImplementationConstructor(
  value: unknown,
): value is ServiceImplementationConstructor {
  if (typeof value !== "function") {
    return false;
  }

  return Function.prototype.toString.call(value).startsWith("class ");
}

export function GetServiceKeyName(serviceKey: ServiceKey): string {
  if (IsServiceIdentity(serviceKey)) {
    return serviceKey.DisplayName;
  }

  return serviceKey.name;
}

export function GetImplementationName(value: unknown): string {
  if (typeof value === "function") {
    return value.name.length === 0 ? "[anonymous-function]" : value.name;
  }

  if (typeof value === "object" && value !== null) {
    const constructorName = value.constructor?.name;

    if (constructorName !== undefined && constructorName.length > 0) {
      return constructorName;
    }
  }

  return "[unknown]";
}