// core-shortcut-system.ts

import { IShortcutExecutionResult, ShortcutExecutionResult } from "./IShortcutExecutionResult.js";
import { ShortcutExecutionStatus } from "./ShortcutExecutionStatus.js";
import { ShortcutSystemComposition } from "./ShortcutSystemComposition.js";
import { ShortcutSystemErrorCode } from "./ShortcutSystemErrorCode.js";
 
export interface IValueObject<T> {
  equals(other: T): boolean;
}

export interface IShortcutGesture extends IValueObject<IShortcutGesture> {}
export interface IShortcutScopeId extends IValueObject<IShortcutScopeId> {}
export interface IShortcutActionId extends IValueObject<IShortcutActionId> {}

export interface IShortcutBinding {
  readonly gesture: IShortcutGesture;
  readonly scopeId: IShortcutScopeId;
  readonly actionId: IShortcutActionId;
}

/* ============================================================================
 * Result Contracts
 * ============================================================================
 */

export interface IShortcutSystemError {
  readonly code: ShortcutSystemErrorCode;
}

export interface IResult<TOk, TError> {
  readonly isSuccess: boolean;
  readonly value?: TOk;
  readonly error?: TError;
}

export class DuplicateBindingErrorCode extends ShortcutSystemErrorCode {
  public equals(other: ShortcutSystemErrorCode): boolean {
    return other instanceof DuplicateBindingErrorCode;
  }
}

export class DuplicateActionErrorCode extends ShortcutSystemErrorCode {
  public equals(other: ShortcutSystemErrorCode): boolean {
    return other instanceof DuplicateActionErrorCode;
  }
}

export class BindingNotFoundErrorCode extends ShortcutSystemErrorCode {
  public equals(other: ShortcutSystemErrorCode): boolean {
    return other instanceof BindingNotFoundErrorCode;
  }
}

export class ActionNotFoundErrorCode extends ShortcutSystemErrorCode {
  public equals(other: ShortcutSystemErrorCode): boolean {
    return other instanceof ActionNotFoundErrorCode;
  }
}

export class NoActionShortcutExecutionStatus extends ShortcutExecutionStatus {
  public equals(other: ShortcutExecutionStatus): boolean {
    return other instanceof NoActionShortcutExecutionStatus;
  }
}
export class NoBindingShortcutExecutionStatus extends ShortcutExecutionStatus {
  public equals(other: ShortcutExecutionStatus): boolean {
    return other instanceof NoBindingShortcutExecutionStatus;
  }
}
export class ShortcutSystemError implements IShortcutSystemError {
  public constructor(public readonly code: ShortcutSystemErrorCode) {}
}

export class OkResult<TOk, TError> implements IResult<TOk, TError> {
  public readonly isSuccess = true;

  public constructor(public readonly value: TOk) {}
}

export class ErrorResult<TOk, TError> implements IResult<TOk, TError> {
  public readonly isSuccess = false;

  public constructor(public readonly error: TError) {}
}

/* ============================================================================
 * Runtime Contracts
 * ============================================================================
 */

export interface IShortcutAction {
  execute(): Promise<void>;
}

export interface IShortcutActionRegistry {
  register(
    actionId: IShortcutActionId,
    action: IShortcutAction,
  ): IResult<void, IShortcutSystemError>;
  unregister(actionId: IShortcutActionId): void;
  tryGet(actionId: IShortcutActionId): IShortcutAction | undefined;
}

export interface IShortcutBindingRegistry {
  register(binding: IShortcutBinding): IResult<void, IShortcutSystemError>;
  unregister(scopeId: IShortcutScopeId, gesture: IShortcutGesture): void;
  tryResolve(
    scopeId: IShortcutScopeId,
    gesture: IShortcutGesture,
  ): IShortcutActionId | undefined;
}

export interface IShortcutScopeProvider {
  getCurrentScope(): IShortcutScopeId;
}

export interface IShortcutService {
  execute(gesture: IShortcutGesture): Promise<IShortcutExecutionResult>;
}

/* ============================================================================
 * Internal Identity Objects
 * ============================================================================
 */

export interface IShortcutBindingIdentity
  extends IValueObject<IShortcutBindingIdentity> {
  readonly scopeId: IShortcutScopeId;
  readonly gesture: IShortcutGesture;
}

export class ShortcutBindingIdentity implements IShortcutBindingIdentity {
  public constructor(
    public readonly scopeId: IShortcutScopeId,
    public readonly gesture: IShortcutGesture,
  ) {}

  public equals(other: IShortcutBindingIdentity): boolean {
    return (
      this.scopeId.equals(other.scopeId) && this.gesture.equals(other.gesture)
    );
  }
}

/* ============================================================================
 * Internal Registry Entry Types
 * ============================================================================
 */

export interface IShortcutActionEntry {
  readonly actionId: IShortcutActionId;
  readonly action: IShortcutAction;
}

export interface IShortcutBindingEntry {
  readonly identity: IShortcutBindingIdentity;
  readonly actionId: IShortcutActionId;
}

export class ShortcutActionEntry implements IShortcutActionEntry {
  public constructor(
    public readonly actionId: IShortcutActionId,
    public readonly action: IShortcutAction,
  ) {}
}

export class ShortcutBindingEntry implements IShortcutBindingEntry {
  public constructor(
    public readonly identity: IShortcutBindingIdentity,
    public readonly actionId: IShortcutActionId,
  ) {}
}

/* ============================================================================
 * Action Registry
 * ============================================================================
 */

export class ShortcutActionRegistry implements IShortcutActionRegistry {
  private readonly entries: IShortcutActionEntry[] = [];

  public register(
    actionId: IShortcutActionId,
    action: IShortcutAction,
  ): IResult<void, IShortcutSystemError> {
    if (this.tryFindEntry(actionId) !== undefined) {
      return new ErrorResult<void, IShortcutSystemError>(
        new ShortcutSystemError(ShortcutSystemErrorCode.DuplicateAction),
      );
    }

    this.entries.push(new ShortcutActionEntry(actionId, action));
    return new OkResult<void, IShortcutSystemError>(undefined);
  }

  public unregister(actionId: IShortcutActionId): void {
    const index = this.findIndex(actionId);

    if (index < 0) {
      return;
    }

    this.entries.splice(index, 1);
  }

  public tryGet(actionId: IShortcutActionId): IShortcutAction | undefined {
    return this.tryFindEntry(actionId)?.action;
  }

  private tryFindEntry(
    actionId: IShortcutActionId,
  ): IShortcutActionEntry | undefined {
    for (const entry of this.entries) {
      if (entry.actionId.equals(actionId)) {
        return entry;
      }
    }

    return undefined;
  }

  private findIndex(actionId: IShortcutActionId): number {
    for (let index = 0; index < this.entries.length; index += 1) {
      if (this.entries[index]?.actionId.equals(actionId)) {
        return index;
      }
    }

    return -1;
  }
}

/* ============================================================================
 * Binding Registry
 * ============================================================================
 */

export class ShortcutBindingRegistry implements IShortcutBindingRegistry {
  private readonly entries: IShortcutBindingEntry[] = [];

  public register(
    binding: IShortcutBinding,
  ): IResult<void, IShortcutSystemError> {
    const identity = new ShortcutBindingIdentity(
      binding.scopeId,
      binding.gesture,
    );

    if (this.tryFindEntry(identity) !== undefined) {
      return new ErrorResult<void, IShortcutSystemError>(
        new ShortcutSystemError(ShortcutSystemErrorCode.DuplicateBinding),
      );
    }

    this.entries.push(new ShortcutBindingEntry(identity, binding.actionId));
    return new OkResult<void, IShortcutSystemError>(undefined);
  }

  public unregister(
    scopeId: IShortcutScopeId,
    gesture: IShortcutGesture,
  ): void {
    const identity = new ShortcutBindingIdentity(scopeId, gesture);
    const index = this.findIndex(identity);

    if (index < 0) {
      return;
    }

    this.entries.splice(index, 1);
  }

  public tryResolve(
    scopeId: IShortcutScopeId,
    gesture: IShortcutGesture,
  ): IShortcutActionId | undefined {
    const identity = new ShortcutBindingIdentity(scopeId, gesture);
    return this.tryFindEntry(identity)?.actionId;
  }

  private tryFindEntry(
    identity: IShortcutBindingIdentity,
  ): IShortcutBindingEntry | undefined {
    for (const entry of this.entries) {
      if (entry.identity.equals(identity)) {
        return entry;
      }
    }

    return undefined;
  }

  private findIndex(identity: IShortcutBindingIdentity): number {
    for (let index = 0; index < this.entries.length; index += 1) {
      const entry = this.entries[index];

      if (entry !== undefined && entry.identity.equals(identity)) {
        return index;
      }
    }

    return -1;
  }
}

/* ============================================================================
 * Shortcut Service
 * ============================================================================
 */

export class ShortcutService implements IShortcutService {
  public constructor(
    private readonly bindingRegistry: IShortcutBindingRegistry,
    private readonly actionRegistry: IShortcutActionRegistry,
    private readonly scopeProvider: IShortcutScopeProvider,
  ) {}

  public async execute(
    gesture: IShortcutGesture,
  ): Promise<IShortcutExecutionResult> {
    const currentScope = this.scopeProvider.getCurrentScope();
    const actionId = this.bindingRegistry.tryResolve(currentScope, gesture);

    if (actionId === undefined) {
      return ShortcutExecutionResult.noBinding();
    }

    const action = this.actionRegistry.tryGet(actionId);

    if (action === undefined) {
      return ShortcutExecutionResult.noAction(actionId);
    }

    await action.execute();

    return ShortcutExecutionResult.executed(actionId);
  }
}

/* ============================================================================
 * Composition Root
 * ============================================================================
 */

export interface IShortcutSystemComposition {
  readonly bindingRegistry: IShortcutBindingRegistry;
  readonly actionRegistry: IShortcutActionRegistry;
  readonly shortcutService: IShortcutService;
}

export class ShortcutSystemComposer {
  public compose(
    scopeProvider: IShortcutScopeProvider,
  ): IShortcutSystemComposition {
    const bindingRegistry = new ShortcutBindingRegistry();
    const actionRegistry = new ShortcutActionRegistry();
    const shortcutService = new ShortcutService(
      bindingRegistry,
      actionRegistry,
      scopeProvider,
    );

    return new ShortcutSystemComposition(
      bindingRegistry,
      actionRegistry,
      shortcutService,
    );
  }
}
