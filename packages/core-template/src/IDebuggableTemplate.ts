import { ITemplate } from "./ITemplate.js";

export interface IDebuggableTemplate<T = Record<string, any>> extends ITemplate<T> {
    raw: string;
  }
  