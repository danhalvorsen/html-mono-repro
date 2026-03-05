// common/implementation/metadata/ExifMetadata.ts

import { ExifValue, IExifMetadata } from "../../interfaces/Image.Common.js";

export class ExifMetadata implements IExifMetadata {
  private readonly map: ReadonlyMap<string, ExifValue>;

  constructor(entries?: Iterable<readonly [string, ExifValue]>) {
    this.map = new Map(entries ?? []);
  }

  get(tag: string): ExifValue | undefined {
    return this.map.get(tag);
  }

  has(tag: string): boolean {
    return this.map.has(tag);
  }

  entries(): IterableIterator<readonly [string, ExifValue]> {
    return this.map.entries();
  }

  set(tag: string, value: ExifValue): ExifMetadata {
    const next = new Map(this.map);
    next.set(tag, value);
    return new ExifMetadata(next);
  }
}