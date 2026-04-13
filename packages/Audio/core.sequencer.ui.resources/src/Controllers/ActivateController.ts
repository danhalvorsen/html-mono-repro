import { type ReactiveController, type ReactiveControllerHost } from "lit";

export type ActivationState = "active" | "inactive";

type ActivationHost = ReactiveControllerHost & Partial<{
  active: boolean;
  state: ActivationState;
}>;

export interface IActivateControllerOptions {
  readonly initialActive?: boolean;
}

export class ActivateController implements ReactiveController {
  private readonly host: ActivationHost;
  private activeValue: boolean;

  public constructor(
    host: ActivationHost,
    options: IActivateControllerOptions = {},
  ) {
    this.host = host;
    this.activeValue = options.initialActive ?? false;
    this.host.addController(this);
    this.syncHostState();
  }

  public get active(): boolean {
    return this.activeValue;
  }

  public get state(): ActivationState {
    return this.activeValue ? "active" : "inactive";
  }

  public activate(): void {
    this.setActive(true);
  }

  public deactivate(): void {
    this.setActive(false);
  }

  public toggle(): void {
    this.setActive(!this.activeValue);
  }

  public setActive(value: boolean): void {
    const normalizedValue = Boolean(value);
    if (this.activeValue === normalizedValue) {
      return;
    }

    this.activeValue = normalizedValue;
    this.syncHostState();
    this.host.requestUpdate();
  }

  public hostConnected(): void {
    this.syncHostState();
  }

  private syncHostState(): void {
    this.host.active = this.activeValue;
    this.host.state = this.state;
  }
}
