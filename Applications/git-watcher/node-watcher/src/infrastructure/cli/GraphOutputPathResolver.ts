import type { IGraphOutputPathResolver } from "../../contracts/cli/IGraphOutputPathResolver.js";

export class GraphOutputPathResolver implements IGraphOutputPathResolver {
  public resolve(templateOrPath: string): string {
    const timestamp = this.createTimestampForFileName(new Date());
    return templateOrPath.replaceAll("{timestamp}", timestamp);
  }

  private createTimestampForFileName(clock: Date): string {
    const year = String(clock.getFullYear());
    const month = String(clock.getMonth() + 1).padStart(2, "0");
    const day = String(clock.getDate()).padStart(2, "0");
    const hour = String(clock.getHours()).padStart(2, "0");
    const minute = String(clock.getMinutes()).padStart(2, "0");
    const second = String(clock.getSeconds()).padStart(2, "0");
    return `${year}${month}${day}-${hour}${minute}${second}`;
  }
}