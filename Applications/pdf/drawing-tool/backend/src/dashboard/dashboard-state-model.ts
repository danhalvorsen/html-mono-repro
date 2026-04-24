export class DashboardStateModel {
  private _requestCount: number;

  public constructor(initialCount?: number) {
    this._requestCount = this.normalize(initialCount);
  }

  public get requestCount(): number {
    return this._requestCount;
  }

  public reset(): void {
    this._requestCount = 0;
  }

  public setFromRowCount(count: number): void {
    this._requestCount = this.normalize(count);
  }

  public increment(): void {
    this._requestCount += 1;
  }

  private normalize(value: unknown): number {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) {
      return 0;
    }
    return Math.floor(n);
  }
}