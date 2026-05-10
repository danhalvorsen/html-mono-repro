import type { ITaskScheduler } from "../application/scheduling/ITaskScheduler";

export class WindowTaskScheduler implements ITaskScheduler {
  public schedule(delayMs: number, action: () => void): void {
    window.setTimeout(action, delayMs);
  }
}

