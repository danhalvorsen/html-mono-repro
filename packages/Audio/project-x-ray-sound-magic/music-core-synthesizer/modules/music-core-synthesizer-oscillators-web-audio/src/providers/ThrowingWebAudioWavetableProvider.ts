import type {
  IWebAudioPeriodicWaveLike,
  IWebAudioWavetableProvider,
} from "../ports/index.js";

export class ThrowingWebAudioWavetableProvider implements IWebAudioWavetableProvider {
  public get(tableId: string): IWebAudioPeriodicWaveLike {
    throw new Error(`No Web Audio wavetable provider configured for tableId '${tableId}'.`);
  }
}
