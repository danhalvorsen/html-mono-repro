// Applications/audio/WebAudio/application-web-audio/src/lit3/WebComponents/Styles/StyleController.ts

import type { ReactiveController, ReactiveControllerHost } from "lit";

export class StyleController implements ReactiveController {
  private readonly host: ReactiveControllerHost & HTMLElement;

  private style!: CSSStyleDeclaration;

  public constructor(host: ReactiveControllerHost & HTMLElement) {
    this.host = host;
    host.addController(this);
  }

  public hostConnected(): void {
    this.style = getComputedStyle(this.host);
  }

  public refresh(): void {
    this.style = getComputedStyle(this.host);
  }

  public color(name: string, fallback = ""): string {
    const value = this.style.getPropertyValue(name).trim();
    return value !== "" ? value : fallback;
  }

  public number(name: string, fallback = 0): number {
    const raw = this.style.getPropertyValue(name).trim();
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
  }
}