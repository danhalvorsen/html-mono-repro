import { IReactiveHost } from "core-reactive-controller/src/index.js";

export class DummyHost implements IReactiveHost {
  addController() { }
  removeController() { }
  notifyConnected() { }
  notifyDisconnected() { }
  notifyUpdate() { }
  notifyUpdated() { }
}
