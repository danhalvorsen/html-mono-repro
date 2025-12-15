import { IDebuggableTemplate } from "./IDebuggableTemplate.js";

export class ValidationTemplate<T = Record<string, any>> implements IDebuggableTemplate<T> {
  constructor(public readonly raw: string) {}

  render(model: T): string {
    try {
      return this.raw.replace(/\$\{(\w+)\}/g, (_, key) => {
        let value: unknown;
        try {
          value = (model as any)[key];
        } catch {
          value = undefined;
        }
        return value !== undefined ? String(value) : `[${key} missing]`;
      });
    } catch (err) {
      return `[template rendering error: ${(err as Error).message ?? "unknown"}]`;
    }
  }
}
