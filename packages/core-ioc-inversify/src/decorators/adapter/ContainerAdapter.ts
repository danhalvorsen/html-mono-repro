// filepath: c:\Users\danha\source\repos\Frontend\Libraries\core-ioc-inversify\src\decorators\adapter\ContainerAdapter.ts
import "reflect-metadata";
import { optional as inversifyOptional, inject as inversifyInject, interfaces } from "inversify";

import { Token } from "./Token.js";
import { ServiceLifetime } from "./ServiceLifetime.js";
import { IContainerAdapter } from "./IContainerAdapter.js";
import { Container } from "inversify";

/**
 * Inversify-backed container adapter implementing IContainerAdapter.
 * String tokens are mapped to deterministic Symbol.for('myioc:Name').
 */
export class ContainerAdapter implements IContainerAdapter {
  // add a flag to control whether to use Symbol.for (global interned symbols)
  private useGlobalSymbols: boolean;
  private container: Container;
  // cache for non-interned symbols so the same symbol is used for a given string token
  private tokenMap: Map<string, symbol>;

  constructor(options?: { useGlobalSymbols?: boolean }) {
    this.useGlobalSymbols = options?.useGlobalSymbols ?? true;
    this.container = new Container({ defaultScope: "Transient", autoBindInjectable: false });
    this.tokenMap = new Map();
  }

  bind<T>(identifier: Token<T>, ctor: new (...args: any[]) => T, lifetime: ServiceLifetime): void {
    const id = this.resolveIdentifier(identifier);
    const binding = this.container.bind<T>(id).to(ctor as any);
    switch (lifetime) {
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

  get<T>(identifier: Token<T>): T {
    const id = this.resolveIdentifier(identifier);
    return this.container.get<T>(id as interfaces.ServiceIdentifier<T>);
  }

  build(): Container {
    return this.container;
  }

  // New: clear all bindings and recreate the container (helps tests and long-running processes)
  clear(): void {
    try {
      // try safe unbindAll if available
      if (typeof (this.container as any).unbindAll === "function") {
        (this.container as any).unbindAll();
      }
    } catch {
      // ignore - we'll recreate container below
    }
    // re-create a fresh container instance to drop references to singletons
    this.container = new Container({ defaultScope: "Transient", autoBindInjectable: false });
    // clear cached non-interned symbols
    this.tokenMap.clear();
  }

  // alias
  dispose(): void {
    this.clear();
  }

  private resolveIdentifier<T>(identifier: Token<T>): interfaces.ServiceIdentifier<T> {
    if (typeof identifier === "string") {
      // use global interned symbols only when configured; for ephemeral tokens prefer non-interned Symbol()
      if (this.useGlobalSymbols) {
        return Symbol.for(`myioc:${identifier}`) as unknown as interfaces.ServiceIdentifier<T>;
      } else {
        // ensure the same non-interned symbol is reused for the same string token
        let sym = this.tokenMap.get(identifier);
        if (!sym) {
          sym = Symbol(`myioc:${identifier}`);
          this.tokenMap.set(identifier, sym);
        }
        return sym as unknown as interfaces.ServiceIdentifier<T>;
      }
    }
    return identifier as interfaces.ServiceIdentifier<T>;
  }
}