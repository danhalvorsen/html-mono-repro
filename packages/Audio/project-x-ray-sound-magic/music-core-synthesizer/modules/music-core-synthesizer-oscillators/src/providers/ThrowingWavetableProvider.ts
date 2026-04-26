import type { IWavetable, IWavetableProvider } from "./IWavetableProvider.js";

export class ThrowingWavetableProvider implements IWavetableProvider {
  public get(tableId: string): IWavetable {
    throw new Error(`No wavetable provider configured for tableId '${tableId}'.`);
  }
}
