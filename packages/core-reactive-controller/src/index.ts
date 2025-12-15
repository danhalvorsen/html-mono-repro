// Contracts
export * from "./contracts/IReactiveController.js";
export * from "./contracts/IReactiveHost.js";
export * from "./contracts/IReactiveLifecycle.js";

// Abstract classes
export * from "./abstract/AbstractReactiveController.js";
export * from "./abstract/AbstractReactiveHost.js";

// Utilities
export * from "./utils/ControllerCollection.js";

// Temporary: remove broken re-export that points to a non-existent JS module.
// export * from "./contracts/IMouseController.js";

// Minimal placeholder API to keep dependents compiling.
export interface MouseControllerOptions {
  // extend later
}

export interface IMouseController {
  // extend later
}

export function createMouseController(_options?: MouseControllerOptions): IMouseController {
  // simple stub; replace with real implementation
  return {} as IMouseController;
}