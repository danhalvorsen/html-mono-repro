export type ExifValue =
  | string
  | number
  | boolean
  | null
  | Date
  | readonly number[]
  | readonly string[];

export interface IExifMetadata {
  get(tag: string): ExifValue | undefined;
  has(tag: string): boolean;
  entries(): IterableIterator<readonly [string, ExifValue]>;
}

export interface IGpsMetadata {
  readonly lat: number;
  readonly lon: number;
  readonly alt?: number;
}

export interface IImageMetadata {
  readonly exif?: IExifMetadata;
  readonly gps?: IGpsMetadata;
}