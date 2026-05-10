export class SystemClock {
  nowUtcIso() {
    return new Date().toISOString();
  }
}