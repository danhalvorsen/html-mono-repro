import type { ReactiveController, ReactiveControllerHost } from "lit";

export interface IOnClickHandler {
  onClick(event: MouseEvent): void;
}

export interface IOnClickControllerHost
  extends ReactiveControllerHost,
    HTMLElement {}

export interface IOnClickControllerOptions {
  readonly handler: IOnClickHandler | ((event: MouseEvent) => void);
}

export class OnClickController implements ReactiveController {
  private readonly host: IOnClickControllerHost;
  private readonly handler: (event: MouseEvent) => void;

  public constructor(
    host: IOnClickControllerHost,
    options: Readonly<IOnClickControllerOptions>,
  ) {
    this.host = host;
    this.handler = this.normalizeHandler(options.handler);

    this.host.addController(this);
  }

  public hostConnected(): void {
    this.host.addEventListener("click", this.onHostClick);
  }

  public hostDisconnected(): void {
    this.host.removeEventListener("click", this.onHostClick);
  }

  private readonly onHostClick = (event: MouseEvent): void => {
    this.handler(event);
  };

  private normalizeHandler(
    handler: IOnClickHandler | ((event: MouseEvent) => void),
  ): (event: MouseEvent) => void {
    if (typeof handler === "function") {
      return handler;
    }

    return (event: MouseEvent): void => {
      handler.onClick(event);
    };
  }
}