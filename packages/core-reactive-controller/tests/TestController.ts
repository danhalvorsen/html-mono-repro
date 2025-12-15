import { AbstractReactiveController } from "core-reactive-controller/src/index.js";

export class TestController extends AbstractReactiveController {
  public events: string[] = [];
  protected onAttach() { this.events.push("attach"); }
  protected onDetach() { this.events.push("detach"); }
}
