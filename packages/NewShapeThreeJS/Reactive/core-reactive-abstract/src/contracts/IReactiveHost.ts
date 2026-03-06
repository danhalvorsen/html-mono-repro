// Reactive/core-reactive-abstract/src/contracts/IReactiveHost.ts

import type { IReactiveController } from "./IReactiveController.js";

export interface IReactiveHost<THost> {
  addController(controller: IReactiveController<THost>): void;
  removeController(controller: IReactiveController<THost>): void;

  /** Marks the host as needing an update cycle */
  requestUpdate(): void;
   
}