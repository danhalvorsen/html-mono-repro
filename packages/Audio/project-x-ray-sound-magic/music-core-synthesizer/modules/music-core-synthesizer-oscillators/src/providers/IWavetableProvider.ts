export interface IWavetable {
  sample(phase01: number): number;
}

export interface IWavetableProvider {
  get(tableId: string): IWavetable;
}
