import * as path from "node:path";
import type { IPathService } from "../../contracts/io/IPathService.js";

export class NodePathService implements IPathService {
  public resolve(...segments: readonly string[]): string {
    return path.resolve(...segments);
  }

  public dirname(value: string): string {
    return path.dirname(value);
  }

  public basename(value: string): string {
    return path.basename(value);
  }

  public relative(from: string, to: string): string {
    return path.relative(from, to);
  }

  public normalize(value: string): string {
    return path.normalize(value);
  }

  public join(...segments: readonly string[]): string {
    return path.join(...segments);
  }
}