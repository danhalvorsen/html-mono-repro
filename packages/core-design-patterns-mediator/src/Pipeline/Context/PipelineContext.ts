import { IContextPipeline } from "./IContextPipeline.js";


export class PipelineContext implements IContextPipeline {
  private readonly store = new Map<symbol, unknown>();

  public set<T>(key: symbol, value: T): void {
    this.store.set(key, value);
  }

  public get<T>(key: symbol): T | undefined {
    return this.store.get(key) as T | undefined;
  }
}
