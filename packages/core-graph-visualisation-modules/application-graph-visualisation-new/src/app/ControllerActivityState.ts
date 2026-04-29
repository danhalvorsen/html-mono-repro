export interface IControllerActivityState {
  readonly activeControllerName: string;
  readonly activityMessage: string;
  setActive(controllerName: string, activityMessage: string): void;
}

export class ControllerActivityState implements IControllerActivityState {
  private activeControllerNameInternal = "none";
  private activityMessageInternal = "No controller activity yet.";

  get activeControllerName(): string {
    return this.activeControllerNameInternal;
  }

  get activityMessage(): string {
    return this.activityMessageInternal;
  }

  setActive(controllerName: string, activityMessage: string): void {
    this.activeControllerNameInternal = controllerName;
    this.activityMessageInternal = activityMessage;
  }
}
