// tests/core-semantic-model-ui-shortcuts.spec.ts

import { describe, it, expect, beforeEach } from "vitest";
import {
  SemanticDomain,
  SemanticProperty,
  SemanticPropertyKey,
  SemanticRelationType,
  ShortcutActionAddress,
  ShortcutActionId,
  ShortcutActions,
  ShortcutBindingAddress,
  ShortcutBindingKey,
  ShortcutGesture,
  ShortcutGestures,
  ShortcutScopeAddress,
  ShortcutScopeId,
  ShortcutScopes,
  ShortcutSemanticFactory,
} from "../src/code.js";

class ShortcutSemanticModelTestFixture {
  public readonly sut: ShortcutSemanticFactory;

  public readonly editorScopeId: ShortcutScopeId;
  public readonly saveActionId: ShortcutActionId;
  public readonly saveGesture: ShortcutGesture;

  public constructor() {
    this.sut = new ShortcutSemanticFactory();
    this.editorScopeId = ShortcutScopes.Editor;
    this.saveActionId = ShortcutActions.SaveDocument;
    this.saveGesture = ShortcutGestures.Save;
  }

  public createEditorScope() {
    return this.sut.createScope(
      this.editorScopeId,
      [
        new SemanticProperty(SemanticPropertyKey.DisplayName, "Editor"),
      ],
    );
  }

  public createSaveAction() {
    return this.sut.createAction(
      this.saveActionId,
      [
        new SemanticProperty(SemanticPropertyKey.Description, "Save current document"),
      ],
    );
  }

  public createSaveBinding() {
    return this.sut.createBinding(
      this.saveGesture,
      this.editorScopeId,
      this.saveActionId,
      [
        new SemanticProperty(SemanticPropertyKey.Category, "file"),
      ],
    );
  }
}

describe("core-semantic-model-ui-shortcuts", () => {
  let fixture: ShortcutSemanticModelTestFixture;

  beforeEach(() => {
    fixture = new ShortcutSemanticModelTestFixture();
  });

  describe("SemanticDomain", () => {
    it("should expose stable semantic domains for shortcut concepts", () => {
      expect(SemanticDomain.UiShortcutBinding.toString()).toBe("ui.shortcut.binding");
      expect(SemanticDomain.UiShortcutScope.toString()).toBe("ui.shortcut.scope");
      expect(SemanticDomain.UiShortcutAction.toString()).toBe("ui.shortcut.action");
    });

    it("should compare semantic domains by value", () => {
      expect(
        SemanticDomain.UiShortcutBinding.equals(SemanticDomain.UiShortcutBinding),
      ).toBe(true);

      expect(
        SemanticDomain.UiShortcutBinding.equals(SemanticDomain.UiShortcutScope),
      ).toBe(false);
    });
  });

  describe("ShortcutScopeId", () => {
    it("should compare scope identifiers by value", () => {
      const left = ShortcutScopeId.create("editor");
      const right = ShortcutScopeId.create("editor");
      const other = ShortcutScopeId.create("timeline");

      expect(left.equals(right)).toBe(true);
      expect(left.equals(other)).toBe(false);
    });

    it("should reject empty scope identifiers", () => {
      expect(() => ShortcutScopeId.create("")).toThrowError();
      expect(() => ShortcutScopeId.create("   ")).toThrowError();
    });
  });

  describe("ShortcutActionId", () => {
    it("should compare action identifiers by value", () => {
      const left = ShortcutActionId.create("save-document");
      const right = ShortcutActionId.create("save-document");
      const other = ShortcutActionId.create("delete-selection");

      expect(left.equals(right)).toBe(true);
      expect(left.equals(other)).toBe(false);
    });

    it("should reject empty action identifiers", () => {
      expect(() => ShortcutActionId.create("")).toThrowError();
      expect(() => ShortcutActionId.create("   ")).toThrowError();
    });
  });

  describe("ShortcutGesture", () => {
    it("should compare gestures by value", () => {
      const left = ShortcutGesture.create("Ctrl+S");
      const right = ShortcutGesture.create("Ctrl+S");
      const other = ShortcutGesture.create("Delete");

      expect(left.equals(right)).toBe(true);
      expect(left.equals(other)).toBe(false);
    });

    it("should reject empty gestures", () => {
      expect(() => ShortcutGesture.create("")).toThrowError();
      expect(() => ShortcutGesture.create("   ")).toThrowError();
    });
  });

  describe("ShortcutBindingKey", () => {
    it("should create a deterministic binding key from scope and gesture", () => {
      const key = ShortcutBindingKey.create(
        fixture.editorScopeId,
        fixture.saveGesture,
      );

      expect(key.toString()).toBe("editor::Ctrl+S");
    });

    it("should compare binding keys by value", () => {
      const left = ShortcutBindingKey.create(
        fixture.editorScopeId,
        fixture.saveGesture,
      );

      const right = ShortcutBindingKey.create(
        ShortcutScopeId.create("editor"),
        ShortcutGesture.create("Ctrl+S"),
      );

      const other = ShortcutBindingKey.create(
        ShortcutScopeId.create("editor"),
        ShortcutGesture.create("Delete"),
      );

      expect(left.equals(right)).toBe(true);
      expect(left.equals(other)).toBe(false);
    });
  });

  describe("addresses", () => {
    it("should create binding address with binding semantic domain", () => {
      const address = new ShortcutBindingAddress("editor::Ctrl+S");

      expect(address.domain.equals(SemanticDomain.UiShortcutBinding)).toBe(true);
      expect(address.key).toBe("editor::Ctrl+S");
    });

    it("should create scope address with scope semantic domain", () => {
      const address = new ShortcutScopeAddress("editor");

      expect(address.domain.equals(SemanticDomain.UiShortcutScope)).toBe(true);
      expect(address.key).toBe("editor");
    });

    it("should create action address with action semantic domain", () => {
      const address = new ShortcutActionAddress("save-document");

      expect(address.domain.equals(SemanticDomain.UiShortcutAction)).toBe(true);
      expect(address.key).toBe("save-document");
    });
  });

  describe("ShortcutSemanticFactory.createScope", () => {
    it("should create a scope with semantic address and properties", () => {
      const scope = fixture.createEditorScope();

      expect(scope.id.equals(fixture.editorScopeId)).toBe(true);
      expect(scope.address.domain.equals(SemanticDomain.UiShortcutScope)).toBe(true);
      expect(scope.address.key).toBe("editor");
      expect(scope.properties).toHaveLength(1);
      expect(scope.properties[0]?.key.equals(SemanticPropertyKey.DisplayName)).toBe(true);
      expect(scope.properties[0]?.value).toBe("Editor");
    });
  });

  describe("ShortcutSemanticFactory.createAction", () => {
    it("should create an action with semantic address and properties", () => {
      const action = fixture.createSaveAction();

      expect(action.id.equals(fixture.saveActionId)).toBe(true);
      expect(action.address.domain.equals(SemanticDomain.UiShortcutAction)).toBe(true);
      expect(action.address.key).toBe("save-document");
      expect(action.properties).toHaveLength(1);
      expect(action.properties[0]?.key.equals(SemanticPropertyKey.Description)).toBe(true);
      expect(action.properties[0]?.value).toBe("Save current document");
    });
  });

  describe("ShortcutSemanticFactory.createBinding", () => {
    it("should create a binding with deterministic address, typed identifiers, and semantic relations", () => {
      const binding = fixture.createSaveBinding();

      expect(binding.address.domain.equals(SemanticDomain.UiShortcutBinding)).toBe(true);
      expect(binding.address.key).toBe("editor::Ctrl+S");

      expect(binding.gesture.equals(fixture.saveGesture)).toBe(true);
      expect(binding.scopeId.equals(fixture.editorScopeId)).toBe(true);
      expect(binding.actionId.equals(fixture.saveActionId)).toBe(true);

      expect(binding.properties).toHaveLength(1);
      expect(binding.properties[0]?.key.equals(SemanticPropertyKey.Category)).toBe(true);
      expect(binding.properties[0]?.value).toBe("file");

      expect(binding.scopeRelations).toHaveLength(1);
      expect(
        binding.scopeRelations[0]?.type.equals(SemanticRelationType.BelongsToScope),
      ).toBe(true);
      expect(
        binding.scopeRelations[0]?.targetId.equals(fixture.editorScopeId),
      ).toBe(true);

      expect(binding.actionRelations).toHaveLength(1);
      expect(
        binding.actionRelations[0]?.type.equals(SemanticRelationType.TriggersAction),
      ).toBe(true);
      expect(
        binding.actionRelations[0]?.targetId.equals(fixture.saveActionId),
      ).toBe(true);
    });
  });

  describe("domain constants", () => {
    it("should expose stable predefined scopes", () => {
      expect(ShortcutScopes.Editor.toString()).toBe("editor");
      expect(ShortcutScopes.Timeline.toString()).toBe("timeline");
      expect(ShortcutScopes.Global.toString()).toBe("global");
    });

    it("should expose stable predefined actions", () => {
      expect(ShortcutActions.SaveDocument.toString()).toBe("save-document");
      expect(ShortcutActions.DeleteSelection.toString()).toBe("delete-selection");
      expect(ShortcutActions.TogglePlayback.toString()).toBe("toggle-playback");
    });

    it("should expose stable predefined gestures", () => {
      expect(ShortcutGestures.Save.toString()).toBe("Ctrl+S");
      expect(ShortcutGestures.Delete.toString()).toBe("Delete");
      expect(ShortcutGestures.TogglePlayback.toString()).toBe("Space");
    });
  });
});