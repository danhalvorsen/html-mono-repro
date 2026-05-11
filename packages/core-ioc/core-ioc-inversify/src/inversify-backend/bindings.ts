import {
  Container,
  type interfaces,
} from "inversify";
import { ServiceLifetime } from "../decorators/adapter/ServiceLifetime.js";
import { Token } from "../decorators/adapter/Token.js";

/**
 * Legacy Inversify helper.
 *
 * This file remains part of the old prototype API.
 */
export function bindClass<T>(
  container: Container,
  identifierOrCtor: Token<T> | string | (new (...args: any[]) => T),
  ctorOrLifetime: unknown,
  lifetimeArg?: ServiceLifetime,
): void {
  const normalized = normalizeBindingArguments(
    identifierOrCtor,
    ctorOrLifetime,
    lifetimeArg,
  );

  const id = resolveServiceIdentifier<T>(normalized.identifier);
  const binding = container.bind<T>(id).to(normalized.ctor);

  switch (normalized.lifetime) {
    case ServiceLifetime.Singleton:
      binding.inSingletonScope();
      break;

    case ServiceLifetime.Scoped:
      binding.inRequestScope();
      break;

    case ServiceLifetime.Transient:
    default:
      binding.inTransientScope();
      break;
  }
}

function normalizeBindingArguments<T>(
  identifierOrCtor: Token<T> | string | (new (...args: any[]) => T),
  ctorOrLifetime: unknown,
  lifetimeArg?: ServiceLifetime,
): {
  readonly identifier: Token<T> | string;
  readonly ctor: new (...args: any[]) => T;
  readonly lifetime: ServiceLifetime;
} {
  if (typeof ctorOrLifetime === "function" && lifetimeArg !== undefined) {
    return {
      identifier: identifierOrCtor as Token<T> | string,
      ctor: ctorOrLifetime as new (...args: any[]) => T,
      lifetime: lifetimeArg,
    };
  }

  return {
    identifier: identifierOrCtor as Token<T> | string,
    ctor: identifierOrCtor as new (...args: any[]) => T,
    lifetime: ctorOrLifetime as ServiceLifetime,
  };
}

function resolveServiceIdentifier<T>(
  identifier: Token<T> | string,
): interfaces.ServiceIdentifier<T> {
  if (typeof identifier === "string") {
    return Symbol.for(`myioc:${identifier}`) as unknown as interfaces.ServiceIdentifier<T>;
  }

  return identifier as interfaces.ServiceIdentifier<T>;
}