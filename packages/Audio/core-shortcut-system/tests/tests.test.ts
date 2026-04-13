// core-shortcut-system.spec.ts

import { beforeEach, describe, expect, it } from "vitest";
import {
  IShortcutGesture,
  IShortcutScopeId,
  IShortcutActionId,
  IShortcutBinding,
  IShortcutAction,
  IShortcutScopeProvider,
  ShortcutBindingRegistry,
  ShortcutActionRegistry,
  ShortcutService,
  ShortcutBindingIdentity
} from "../src/core-shortcut-system.js";

import {ShortcutSystemErrorCode} from "../src/ShortcutSystemErrorCode.js";
import { ShortcutExecutionStatus } from "../src/ShortcutExecutionStatus.js";  
import {ShortcutSystemComposer} from "../src/ShortcutSystemComposer.js";

/* ============================================================================
 * Test Doubles
 * ============================================================================
 */

abstract class StringValueObject<T> {
  protected constructor(private readonly value: string) {
    if (value.trim().length === 0) {
      throw new Error(`${new.target.name} cannot be empty.`);
    }
  }

  public abstract equals(other: T): boolean;

  public toString(): string {
    return this.value;
  }

  protected sameValue(otherValue: string): boolean {
    return this.value === otherValue;
  }
}

class TestShortcutGesture
  extends StringValueObject<IShortcutGesture>
  implements IShortcutGesture
{
  private constructor(value: string) {
    super(value);
  }

  public static create(value: string): TestShortcutGesture {
    return new TestShortcutGesture(value);
  }

  public equals(other: IShortcutGesture): boolean {
    return this.sameValue(other.toString());
  }
}

class TestShortcutScopeId
  extends StringValueObject<IShortcutScopeId>
  implements IShortcutScopeId
{
  private constructor(value: string) {
    super(value);
  }

  public static create(value: string): TestShortcutScopeId {
    return new TestShortcutScopeId(value);
  }

  public equals(other: IShortcutScopeId): boolean {
    return this.sameValue(other.toString());
  }
}

class TestShortcutActionId
  extends StringValueObject<IShortcutActionId>
  implements IShortcutActionId
{
  private constructor(value: string) {
    super(value);
  }

  public static create(value: string): TestShortcutActionId {
    return new TestShortcutActionId(value);
  }

  public equals(other: IShortcutActionId): boolean {
    return this.sameValue(other.toString());
  }
}

class TestShortcutBinding implements IShortcutBinding {
  public constructor(
    public readonly gesture: IShortcutGesture,
    public readonly scopeId: IShortcutScopeId,
    public readonly actionId: IShortcutActionId,
  ) {}
}

class RecordingShortcutAction implements IShortcutAction {
  public executionCount = 0;

  public async execute(): Promise<void> {
    this.executionCount += 1;
  }
}

class FixedShortcutScopeProvider implements IShortcutScopeProvider {
  public constructor(
    private readonly currentScope: IShortcutScopeId,
  ) {}

  public getCurrentScope(): IShortcutScopeId {
    return this.currentScope;
  }
}

/* ============================================================================
 * Fixture
 * ============================================================================
 */

class CoreShortcutSystemFixture {
  public readonly editorScope = TestShortcutScopeId.create("editor");
  public readonly timelineScope = TestShortcutScopeId.create("timeline");

  public readonly saveGesture = TestShortcutGesture.create("Ctrl+S");
  public readonly deleteGesture = TestShortcutGesture.create("Delete");

  public readonly saveActionId = TestShortcutActionId.create("save-document");
  public readonly deleteActionId = TestShortcutActionId.create("delete-selection");

  public readonly saveBinding = new TestShortcutBinding(
    this.saveGesture,
    this.editorScope,
    this.saveActionId,
  );

  public readonly deleteBinding = new TestShortcutBinding(
    this.deleteGesture,
    this.editorScope,
    this.deleteActionId,
  );

  public readonly saveAction = new RecordingShortcutAction();
  public readonly deleteAction = new RecordingShortcutAction();

  public readonly scopeProvider = new FixedShortcutScopeProvider(this.editorScope);

  public readonly bindingRegistry = new ShortcutBindingRegistry();
  public readonly actionRegistry = new ShortcutActionRegistry();
  public readonly shortcutService = new ShortcutService(
    this.bindingRegistry,
    this.actionRegistry,
    this.scopeProvider,
  );

  public registerSaveBinding(): void {
    const result = this.bindingRegistry.register(this.saveBinding);
    expect(result.isSuccess).toBe(true);
  }

  public registerDeleteBinding(): void {
    const result = this.bindingRegistry.register(this.deleteBinding);
    expect(result.isSuccess).toBe(true);
  }

  public registerSaveAction(): void {
    const result = this.actionRegistry.register(this.saveActionId, this.saveAction);
    expect(result.isSuccess).toBe(true);
  }

  public registerDeleteAction(): void {
    const result = this.actionRegistry.register(this.deleteActionId, this.deleteAction);
    expect(result.isSuccess).toBe(true);
  }
}

/* ============================================================================
 * Tests
 * ============================================================================
 */

describe("core-shortcut-system", () => {
  let fixture: CoreShortcutSystemFixture;

  beforeEach(() => {
    fixture = new CoreShortcutSystemFixture();
  });

  describe("ShortcutBindingIdentity", () => {
    it("should compare scope and gesture by value", () => {
      const left = new ShortcutBindingIdentity(
        TestShortcutScopeId.create("editor"),
        TestShortcutGesture.create("Ctrl+S"),
      );

      const right = new ShortcutBindingIdentity(
        TestShortcutScopeId.create("editor"),
        TestShortcutGesture.create("Ctrl+S"),
      );

      const other = new ShortcutBindingIdentity(
        TestShortcutScopeId.create("editor"),
        TestShortcutGesture.create("Delete"),
      );

      expect(left.equals(right)).toBe(true);
      expect(left.equals(other)).toBe(false);
    });
  });

  describe("ShortcutBindingRegistry.register", () => {
    it("should register a binding and resolve its action id by scope and gesture", () => {
      fixture.registerSaveBinding();

      const resolved = fixture.bindingRegistry.tryResolve(
        fixture.editorScope,
        fixture.saveGesture,
      );

      expect(resolved?.equals(fixture.saveActionId)).toBe(true);
    });

    it("should reject duplicate binding registration for the same scope and gesture", () => {
      fixture.registerSaveBinding();

      const duplicateResult = fixture.bindingRegistry.register(
        new TestShortcutBinding(
          TestShortcutGesture.create("Ctrl+S"),
          TestShortcutScopeId.create("editor"),
          fixture.deleteActionId,
        ),
      );

      expect(duplicateResult.isSuccess).toBe(false);
      expect(
        duplicateResult.error?.code.equals(ShortcutSystemErrorCode.DuplicateBinding),
      ).toBe(true);
    });

    it("should allow the same gesture in a different scope", () => {
      fixture.registerSaveBinding();

      const result = fixture.bindingRegistry.register(
        new TestShortcutBinding(
          fixture.saveGesture,
          fixture.timelineScope,
          fixture.deleteActionId,
        ),
      );

      expect(result.isSuccess).toBe(true);

      const editorResolved = fixture.bindingRegistry.tryResolve(
        fixture.editorScope,
        fixture.saveGesture,
      );

      const timelineResolved = fixture.bindingRegistry.tryResolve(
        fixture.timelineScope,
        fixture.saveGesture,
      );

      expect(editorResolved?.equals(fixture.saveActionId)).toBe(true);
      expect(timelineResolved?.equals(fixture.deleteActionId)).toBe(true);
    });
  });

  describe("ShortcutBindingRegistry.unregister", () => {
    it("should remove a registered binding", () => {
      fixture.registerSaveBinding();

      fixture.bindingRegistry.unregister(fixture.editorScope, fixture.saveGesture);

      const resolved = fixture.bindingRegistry.tryResolve(
        fixture.editorScope,
        fixture.saveGesture,
      );

      expect(resolved).toBeUndefined();
    });
  });

  describe("ShortcutActionRegistry.register", () => {
    it("should register and return a matching action by action id", () => {
      fixture.registerSaveAction();

      const action = fixture.actionRegistry.tryGet(fixture.saveActionId);

      expect(action).toBeDefined();
    });

    it("should reject duplicate action registration for the same action id", () => {
      fixture.registerSaveAction();

      const duplicateResult = fixture.actionRegistry.register(
        TestShortcutActionId.create("save-document"),
        new RecordingShortcutAction(),
      );

      expect(duplicateResult.isSuccess).toBe(false);
      expect(
        duplicateResult.error?.code.equals(ShortcutSystemErrorCode.DuplicateAction),
      ).toBe(true);
    });
  });

  describe("ShortcutActionRegistry.unregister", () => {
    it("should remove a registered action", () => {
      fixture.registerSaveAction();

      fixture.actionRegistry.unregister(fixture.saveActionId);

      const action = fixture.actionRegistry.tryGet(fixture.saveActionId);

      expect(action).toBeUndefined();
    });
  });

  describe("ShortcutService.execute", () => {
    it("should execute the resolved action for the current scope", async () => {
      fixture.registerSaveBinding();
      fixture.registerSaveAction();

      const result = await fixture.shortcutService.execute(fixture.saveGesture);

      expect(result.status.equals(ShortcutExecutionStatus.Executed)).toBe(true);
      expect(result.actionId?.equals(fixture.saveActionId)).toBe(true);
      expect(fixture.saveAction.executionCount).toBe(1);
    });

    it("should return no-binding when no binding exists for the current scope and gesture", async () => {
      fixture.registerSaveAction();

      const result = await fixture.shortcutService.execute(fixture.saveGesture);

      expect(result.status.equals(ShortcutExecutionStatus.NoBinding)).toBe(true);
      expect(result.actionId).toBeUndefined();
      expect(fixture.saveAction.executionCount).toBe(0);
    });

    it("should return no-action when a binding exists but the action is not registered", async () => {
      fixture.registerSaveBinding();

      const result = await fixture.shortcutService.execute(fixture.saveGesture);

      expect(result.status.equals(ShortcutExecutionStatus.NoAction)).toBe(true);
      expect(result.actionId?.equals(fixture.saveActionId)).toBe(true);
    });

    it("should not execute a binding that belongs to another scope", async () => {
      const otherScopeBinding = new TestShortcutBinding(
        fixture.saveGesture,
        fixture.timelineScope,
        fixture.saveActionId,
      );

      const bindingResult = fixture.bindingRegistry.register(otherScopeBinding);
      const actionResult = fixture.actionRegistry.register(fixture.saveActionId, fixture.saveAction);

      expect(bindingResult.isSuccess).toBe(true);
      expect(actionResult.isSuccess).toBe(true);

      const result = await fixture.shortcutService.execute(fixture.saveGesture);

      expect(result.status.equals(ShortcutExecutionStatus.NoBinding)).toBe(true);
      expect(fixture.saveAction.executionCount).toBe(0);
    });
  });

  describe("ShortcutSystemComposer.compose", () => {
    it("should compose a usable shortcut system with explicit dependencies", async () => {
      const composer = new ShortcutSystemComposer();
      const composition = composer.compose(fixture.scopeProvider);

      const action = new RecordingShortcutAction();

      const registerActionResult = composition.actionRegistry.register(
        fixture.saveActionId,
        action,
      );

      const registerBindingResult = composition.bindingRegistry.register(
        fixture.saveBinding,
      );

      expect(registerActionResult.isSuccess).toBe(true);
      expect(registerBindingResult.isSuccess).toBe(true);

      const result = await composition.shortcutService.execute(fixture.saveGesture);

      expect(result.status.equals(ShortcutExecutionStatus.Executed)).toBe(true);
      expect(action.executionCount).toBe(1);
    });
  });
});