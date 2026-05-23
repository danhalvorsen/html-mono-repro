export type RgbaImageData = Readonly<{
  readonly width: number;
  readonly height: number;
  readonly data: Uint8ClampedArray | Uint8Array | readonly number[];
}>;