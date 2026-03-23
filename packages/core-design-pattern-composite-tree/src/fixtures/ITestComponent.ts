import { IComponent } from "../IComponent.js";

export interface ITestComponent extends IComponent<ITestComponent> {
  readonly executionLog: readonly string[];
}
