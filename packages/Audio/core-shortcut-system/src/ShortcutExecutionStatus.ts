import { IValueObject, NoBindingShortcutExecutionStatus, NoActionShortcutExecutionStatus } from "./core-shortcut-system.js";
import { ExecutedShortcutExecutionStatus } from "./ExecutedShortcutExecutionStatus.js";

export abstract class ShortcutExecutionStatus implements IValueObject<ShortcutExecutionStatus> {
  public static readonly Executed = new ExecutedShortcutExecutionStatus();
  public static readonly NoBinding = new NoBindingShortcutExecutionStatus();
  public static readonly NoAction = new NoActionShortcutExecutionStatus();

  public abstract equals(other: ShortcutExecutionStatus): boolean;
}
