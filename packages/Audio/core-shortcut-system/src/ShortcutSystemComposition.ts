import { IShortcutSystemComposition, IShortcutBindingRegistry, IShortcutActionRegistry } from "./core-shortcut-system.js";
import { IShortcutService } from "./IShortcutService.js";


export class ShortcutSystemComposition implements IShortcutSystemComposition {
  public constructor(
    public readonly bindingRegistry: IShortcutBindingRegistry,
    public readonly actionRegistry: IShortcutActionRegistry,
    public readonly shortcutService: IShortcutService
  ) { }
}
