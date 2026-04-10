import { ShortcutExecutionStatus } from "./ShortcutExecutionStatus.js";


export class ExecutedShortcutExecutionStatus extends ShortcutExecutionStatus {
  public equals(other: ShortcutExecutionStatus): boolean {
    return other instanceof ExecutedShortcutExecutionStatus;
  }
}
