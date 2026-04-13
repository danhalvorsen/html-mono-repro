import { IShortcutGesture } from "./core-shortcut-system.js";
import { IShortcutExecutionResult } from "./IShortcutExecutionResult.js";


export interface IShortcutService {
  execute(gesture: IShortcutGesture): Promise<IShortcutExecutionResult>;
}
