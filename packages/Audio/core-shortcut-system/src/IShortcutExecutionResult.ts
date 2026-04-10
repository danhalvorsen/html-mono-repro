import { IShortcutActionId } from "./core-shortcut-system.js";
import { ShortcutExecutionStatus } from "./ShortcutExecutionStatus.js";

export interface IShortcutExecutionResult {
  readonly status: ShortcutExecutionStatus;
  readonly actionId?: IShortcutActionId;
}
export class ShortcutExecutionResult implements IShortcutExecutionResult {
  public readonly actionId?: IShortcutActionId;

  private constructor(
    public readonly status: ShortcutExecutionStatus,
    actionId?: IShortcutActionId,
  ) {
    if (actionId !== undefined) {
      this.actionId = actionId;
    }
  }

  public static executed(
    actionId: IShortcutActionId,
  ): ShortcutExecutionResult {
    return new ShortcutExecutionResult(
      ShortcutExecutionStatus.Executed,
      actionId,
    );
  }

  public static noBinding(): ShortcutExecutionResult {
    return new ShortcutExecutionResult(
      ShortcutExecutionStatus.NoBinding,
    );
  }

  public static noAction(
    actionId: IShortcutActionId,
  ): ShortcutExecutionResult {
    return new ShortcutExecutionResult(
      ShortcutExecutionStatus.NoAction,
      actionId,
    );
  }
}