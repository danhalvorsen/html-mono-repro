import { IShortcutScopeProvider, IShortcutSystemComposition, ShortcutBindingRegistry, ShortcutActionRegistry, ShortcutService } from "./core-shortcut-system.js";
import { ShortcutSystemComposition } from "./ShortcutSystemComposition.js";


export class ShortcutSystemComposer {
  public compose(
    scopeProvider: IShortcutScopeProvider
  ): IShortcutSystemComposition {
    const bindingRegistry = new ShortcutBindingRegistry();
    const actionRegistry = new ShortcutActionRegistry();
    const shortcutService = new ShortcutService(
      bindingRegistry,
      actionRegistry,
      scopeProvider
    );

    return new ShortcutSystemComposition(
      bindingRegistry,
      actionRegistry,
      shortcutService
    );
  }
}
