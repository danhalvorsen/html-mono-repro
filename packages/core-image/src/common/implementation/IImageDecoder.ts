import { IImage } from "./IImage.js";

export interface IImageDecoder {
  readonly format: string;
  decode(buffer: ArrayBuffer): Promise<IImage>;
}
