import { IDebuggableTemplate } from "./IDebuggableTemplate.js";

 export class CrossPlatformTemplate<T = Record<string, any>> implements IDebuggableTemplate<T> {
  constructor(public readonly raw: string) { }

  render(model: T): string {
    return this.raw.replace(/\$\{(\w+)\}/g, (_, key) => {
      const value = (model as any)[key];
      return value !== undefined ? String(value) : `[${key} missing]`;
    });
  }
}
