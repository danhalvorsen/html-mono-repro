import type { Path } from "./code.js";
import { FileSystemEventType } from "./FileSystemEventType.js";

export class FileSystemEvent {
  public constructor(
    public readonly type: FileSystemEventType,
    public readonly path: Path,
    public readonly relative: string,
    public readonly timestampUtcMs: number
  ) {}
}
