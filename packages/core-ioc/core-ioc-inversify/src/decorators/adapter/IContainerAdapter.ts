
import { Token } from "./Token.js";
import { ServiceLifetime } from "./ServiceLifetime.js";

export interface IContainerAdapter {
  bind<T>(identifier: Token<T>, ctor: new (...args: any[]) => T, lifetime: ServiceLifetime): void;
  get<T>(identifier: Token<T>): T;
  build(): any;
}