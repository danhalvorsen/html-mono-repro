import "reflect-metadata";
import {
  Container,
  type interfaces,
} from "inversify";

import { Token } from "./Token.js";
import { ServiceLifetime } from "./ServiceLifetime.js";
import { IContainerAdapter } from "./IContainerAdapter.js";

/**
 * Legacy Inversify-backed adapter.
 *
 * This file remains part of the old prototype API.
 * The new façade lives under src/new.
 */
export class ContainerAdapter implements IContainerAdapter {
  private readonly useGlobalSymbols: boolean;
  private container: Container;
  private readonly tokenMap: Map<string, symbol>;

  public constructor(options?: { useGlobalSymbols?: boolean }) {
    this.useGlobalSymbols = options?.useGlobalSymbols ?? true;
    this.container = this.createContainer();
    this.tokenMap = new Map();
  }

  public bind<T>(
    identifier: Token<T>,
    ctor: new (...args: any[]) => T,
    lifetime: ServiceLifetime,
  ): void {
    const id = this.resolveIdentifier(identifier);
    const binding = this.container.bind<T>(id).to(ctor);

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

  public get<T>(identifier: Token<T>): T {
    const id = this.resolveIdentifier(identifier);

    return this.container.get<T>(id);
  }

  public build(): Container {
    return this.container;
  }

  public clear(): void {
    try {
      const maybeContainer = this.container as unknown as {
        unbindAll?: () => void;
      };

      maybeContainer.unbindAll?.();
    } catch {
      // Recreate below.
    }

    this.container = this.createContainer();
    this.tokenMap.clear();
  }

  public dispose(): void {
    this.clear();
  }

  private createContainer(): Container {
    return new Container({
      defaultScope: "Transient",
      autoBindInjectable: false,
    });
  }

  private resolveIdentifier<T>(identifier: Token<T>): interfaces.ServiceIdentifier<T> {
    if (typeof identifier === "string") {
      if (this.useGlobalSymbols) {
        return Symbol.for(`myioc:${identifier}`) as unknown as interfaces.ServiceIdentifier<T>;
      }

      let symbol = this.tokenMap.get(identifier);

      if (symbol === undefined) {
        symbol = Symbol(`myioc:${identifier}`);
        this.tokenMap.set(identifier, symbol);
      }

      return symbol as unknown as interfaces.ServiceIdentifier<T>;
    }

    return identifier as interfaces.ServiceIdentifier<T>;
  }
}