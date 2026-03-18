import type { IStyle } from "./IStyle.js";
import type { IStyleReference } from "./IStyleReference.js";
 
export interface IStyleResolver {
  resolve(reference?: Readonly<IStyleReference>): IStyle;
}