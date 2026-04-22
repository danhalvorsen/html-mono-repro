import type { IClock } from "../../contracts/time/IClock.js";

export class SystemClock implements IClock {
  public nowIsoUtc(): string {
    return new Date().toISOString();
  }
}