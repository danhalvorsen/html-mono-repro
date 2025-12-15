import { ITemplate } from "./ITemplate.js";

export class KeyValueReportTemplate<T extends Record<string, unknown>>
  implements ITemplate<T>
{
  constructor(
    private readonly separator: string = ": ",
    private readonly lineBreak: string = "\n"
  ) {}

  render(model: T): string {
    return Object.entries(model)
      .map(([key, value]) => `${key}${this.separator}${this.stringify(value)}`)
      .join(this.lineBreak);
  }

  private stringify(value: unknown): string {
    if (value !== null && typeof value === "object") {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return "[unserializable object]";
      }
    }
    return String(value);
  }
}
