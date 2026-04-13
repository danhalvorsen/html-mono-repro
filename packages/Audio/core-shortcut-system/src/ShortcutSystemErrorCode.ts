import { IValueObject, DuplicateBindingErrorCode, DuplicateActionErrorCode, BindingNotFoundErrorCode, ActionNotFoundErrorCode } from "./core-shortcut-system.js";


export abstract class ShortcutSystemErrorCode implements IValueObject<ShortcutSystemErrorCode> {
  public static readonly DuplicateBinding = new DuplicateBindingErrorCode();
  public static readonly DuplicateAction = new DuplicateActionErrorCode();
  public static readonly BindingNotFound = new BindingNotFoundErrorCode();
  public static readonly ActionNotFound = new ActionNotFoundErrorCode();

  public abstract equals(other: ShortcutSystemErrorCode): boolean;
}
