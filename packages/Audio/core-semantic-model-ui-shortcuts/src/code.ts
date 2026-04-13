// core-semantic-model-ui-shortcuts.ts

/* ============================================================================
 * Core Value Object Contracts
 * ============================================================================
 */

export interface IValueObject<T> {
  equals(other: T): boolean;
  toString(): string;
}

abstract class StringValueObject<T> implements IValueObject<T> {
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

/* ============================================================================
 * Semantic Core Contracts
 * ============================================================================
 */

export interface ISemanticAddress {
  readonly domain: SemanticDomain;
  readonly key: string;
}

export interface ISemanticPropertyKey extends IValueObject<ISemanticPropertyKey> {}

export interface ISemanticRelationType extends IValueObject<ISemanticRelationType> {}

export interface ISemanticProperty {
  readonly key: ISemanticPropertyKey;
  readonly value: unknown;
}

export interface ISemanticRelation<TTargetId extends IValueObject<TTargetId>> {
  readonly type: ISemanticRelationType;
  readonly targetId: TTargetId;
}

/* ============================================================================
 * Semantic Domain
 * ============================================================================
 */

export class SemanticDomain extends StringValueObject<SemanticDomain> {
  public static readonly UiShortcutBinding = new SemanticDomain("ui.shortcut.binding");
  public static readonly UiShortcutScope = new SemanticDomain("ui.shortcut.scope");
  public static readonly UiShortcutAction = new SemanticDomain("ui.shortcut.action");

  private constructor(value: string) {
    super(value);
  }

  public equals(other: SemanticDomain): boolean {
    return this.sameValue(other.toString());
  }
}

/* ============================================================================
 * Strongly Typed Shortcut Identities
 * ============================================================================
 */

export interface IShortcutGesture extends IValueObject<IShortcutGesture> {}
export interface IShortcutScopeId extends IValueObject<IShortcutScopeId> {}
export interface IShortcutActionId extends IValueObject<IShortcutActionId> {}

export class ShortcutGesture extends StringValueObject<IShortcutGesture> implements IShortcutGesture {
  private constructor(value: string) {
    super(value);
  }

  public static create(value: string): ShortcutGesture {
    return new ShortcutGesture(value);
  }

  public equals(other: IShortcutGesture): boolean {
    return this.sameValue(other.toString());
  }
}

export class ShortcutScopeId extends StringValueObject<IShortcutScopeId> implements IShortcutScopeId {
  private constructor(value: string) {
    super(value);
  }

  public static create(value: string): ShortcutScopeId {
    return new ShortcutScopeId(value);
  }

  public equals(other: IShortcutScopeId): boolean {
    return this.sameValue(other.toString());
  }
}

export class ShortcutActionId extends StringValueObject<IShortcutActionId> implements IShortcutActionId {
  private constructor(value: string) {
    super(value);
  }

  public static create(value: string): ShortcutActionId {
    return new ShortcutActionId(value);
  }

  public equals(other: IShortcutActionId): boolean {
    return this.sameValue(other.toString());
  }
}

/* ============================================================================
 * Strongly Typed Semantic Keys
 * ============================================================================
 */

export class SemanticPropertyKey extends StringValueObject<ISemanticPropertyKey> implements ISemanticPropertyKey {
  public static readonly Description = new SemanticPropertyKey("description");
  public static readonly DisplayName = new SemanticPropertyKey("display-name");
  public static readonly Category = new SemanticPropertyKey("category");

  private constructor(value: string) {
    super(value);
  }

  public static create(value: string): SemanticPropertyKey {
    return new SemanticPropertyKey(value);
  }

  public equals(other: ISemanticPropertyKey): boolean {
    return this.sameValue(other.toString());
  }
}

export class SemanticRelationType extends StringValueObject<ISemanticRelationType> implements ISemanticRelationType {
  public static readonly BelongsToScope = new SemanticRelationType("belongs-to-scope");
  public static readonly TriggersAction = new SemanticRelationType("triggers-action");

  private constructor(value: string) {
    super(value);
  }

  public static create(value: string): SemanticRelationType {
    return new SemanticRelationType(value);
  }

  public equals(other: ISemanticRelationType): boolean {
    return this.sameValue(other.toString());
  }
}

/* ============================================================================
 * Semantic Address
 * ============================================================================
 */

export class SemanticAddress implements ISemanticAddress {
  public constructor(
    public readonly domain: SemanticDomain,
    public readonly key: string,
  ) {
    if (key.trim().length === 0) {
      throw new Error("SemanticAddress key cannot be empty.");
    }
  }
}

/* ============================================================================
 * Shortcut Semantic Address Types
 * ============================================================================
 */

export interface IShortcutBindingAddress extends ISemanticAddress {}
export interface IShortcutScopeAddress extends ISemanticAddress {}
export interface IShortcutActionAddress extends ISemanticAddress {}

export class ShortcutBindingAddress extends SemanticAddress implements IShortcutBindingAddress {
  public constructor(key: string) {
    super(SemanticDomain.UiShortcutBinding, key);
  }
}

export class ShortcutScopeAddress extends SemanticAddress implements IShortcutScopeAddress {
  public constructor(key: string) {
    super(SemanticDomain.UiShortcutScope, key);
  }
}

export class ShortcutActionAddress extends SemanticAddress implements IShortcutActionAddress {
  public constructor(key: string) {
    super(SemanticDomain.UiShortcutAction, key);
  }
}

/* ============================================================================
 * Semantic Property / Relation Implementations
 * ============================================================================
 */

export class SemanticProperty implements ISemanticProperty {
  public constructor(
    public readonly key: ISemanticPropertyKey,
    public readonly value: unknown,
  ) {}
}

export class ShortcutActionRelation implements ISemanticRelation<IShortcutActionId> {
  public constructor(
    public readonly type: ISemanticRelationType,
    public readonly targetId: IShortcutActionId,
  ) {}
}

export class ShortcutScopeRelation implements ISemanticRelation<IShortcutScopeId> {
  public constructor(
    public readonly type: ISemanticRelationType,
    public readonly targetId: IShortcutScopeId,
  ) {}
}

/* ============================================================================
 * Shortcut Semantic Contracts
 * ============================================================================
 */

export interface IShortcutScope {
  readonly id: IShortcutScopeId;
  readonly address: IShortcutScopeAddress;
  readonly properties: readonly ISemanticProperty[];
}

export interface IShortcutAction {
  readonly id: IShortcutActionId;
  readonly address: IShortcutActionAddress;
  readonly properties: readonly ISemanticProperty[];
}

export interface IShortcutBinding {
  readonly address: IShortcutBindingAddress;
  readonly gesture: IShortcutGesture;
  readonly scopeId: IShortcutScopeId;
  readonly actionId: IShortcutActionId;
  readonly properties: readonly ISemanticProperty[];
  readonly scopeRelations: readonly ISemanticRelation<IShortcutScopeId>[];
  readonly actionRelations: readonly ISemanticRelation<IShortcutActionId>[];
}

/* ============================================================================
 * Shortcut Semantic Implementations
 * ============================================================================
 */

export class ShortcutScope implements IShortcutScope {
  public constructor(
    public readonly id: IShortcutScopeId,
    public readonly address: IShortcutScopeAddress,
    public readonly properties: readonly ISemanticProperty[] = [],
  ) {}
}

export class ShortcutAction implements IShortcutAction {
  public constructor(
    public readonly id: IShortcutActionId,
    public readonly address: IShortcutActionAddress,
    public readonly properties: readonly ISemanticProperty[] = [],
  ) {}
}

export class ShortcutBinding implements IShortcutBinding {
  public constructor(
    public readonly address: IShortcutBindingAddress,
    public readonly gesture: IShortcutGesture,
    public readonly scopeId: IShortcutScopeId,
    public readonly actionId: IShortcutActionId,
    public readonly properties: readonly ISemanticProperty[] = [],
    public readonly scopeRelations: readonly ISemanticRelation<IShortcutScopeId>[] = [],
    public readonly actionRelations: readonly ISemanticRelation<IShortcutActionId>[] = [],
  ) {}
}

/* ============================================================================
 * Shortcut Domain Constants
 * ============================================================================
 */

export class ShortcutScopes {
  public static readonly Editor = ShortcutScopeId.create("editor");
  public static readonly Timeline = ShortcutScopeId.create("timeline");
  public static readonly Global = ShortcutScopeId.create("global");

  private constructor() {}
}

export class ShortcutActions {
  public static readonly SaveDocument = ShortcutActionId.create("save-document");
  public static readonly DeleteSelection = ShortcutActionId.create("delete-selection");
  public static readonly TogglePlayback = ShortcutActionId.create("toggle-playback");

  private constructor() {}
}

export class ShortcutGestures {
  public static readonly Save = ShortcutGesture.create("Ctrl+S");
  public static readonly Delete = ShortcutGesture.create("Delete");
  public static readonly TogglePlayback = ShortcutGesture.create("Space");

  private constructor() {}
}

/* ============================================================================
 * Semantic Factory
 * ============================================================================
 */

export interface IShortcutSemanticFactory {
  createScope(
    id: IShortcutScopeId,
    properties?: readonly ISemanticProperty[],
  ): IShortcutScope;

  createAction(
    id: IShortcutActionId,
    properties?: readonly ISemanticProperty[],
  ): IShortcutAction;

  createBinding(
    gesture: IShortcutGesture,
    scopeId: IShortcutScopeId,
    actionId: IShortcutActionId,
    properties?: readonly ISemanticProperty[],
  ): IShortcutBinding;
}

export class ShortcutSemanticFactory implements IShortcutSemanticFactory {
  public createScope(
    id: IShortcutScopeId,
    properties: readonly ISemanticProperty[] = [],
  ): IShortcutScope {
    return new ShortcutScope(
      id,
      new ShortcutScopeAddress(id.toString()),
      properties,
    );
  }

  public createAction(
    id: IShortcutActionId,
    properties: readonly ISemanticProperty[] = [],
  ): IShortcutAction {
    return new ShortcutAction(
      id,
      new ShortcutActionAddress(id.toString()),
      properties,
    );
  }

  public createBinding(
    gesture: IShortcutGesture,
    scopeId: IShortcutScopeId,
    actionId: IShortcutActionId,
    properties: readonly ISemanticProperty[] = [],
  ): IShortcutBinding {
    const bindingKey = ShortcutBindingKey.create(scopeId, gesture);

    return new ShortcutBinding(
      new ShortcutBindingAddress(bindingKey.toString()),
      gesture,
      scopeId,
      actionId,
      properties,
      [new ShortcutScopeRelation(SemanticRelationType.BelongsToScope, scopeId)],
      [new ShortcutActionRelation(SemanticRelationType.TriggersAction, actionId)],
    );
  }
}

/* ============================================================================
 * Binding Key Value Object
 * ============================================================================
 */

export class ShortcutBindingKey extends StringValueObject<ShortcutBindingKey> {
  private constructor(value: string) {
    super(value);
  }

  public static create(
    scopeId: IShortcutScopeId,
    gesture: IShortcutGesture,
  ): ShortcutBindingKey {
    return new ShortcutBindingKey(`${scopeId.toString()}::${gesture.toString()}`);
  }

  public equals(other: ShortcutBindingKey): boolean {
    return this.sameValue(other.toString());
  }
}

/* ============================================================================
 * Example Usage
 * ============================================================================
 */

const factory = new ShortcutSemanticFactory();

const editorScope = factory.createScope(
  ShortcutScopes.Editor,
  [
    new SemanticProperty(SemanticPropertyKey.DisplayName, "Editor"),
  ],
);

const saveAction = factory.createAction(
  ShortcutActions.SaveDocument,
  [
    new SemanticProperty(SemanticPropertyKey.Description, "Save current document"),
  ],
);

const saveBinding = factory.createBinding(
  ShortcutGestures.Save,
  editorScope.id,
  saveAction.id,
  [
    new SemanticProperty(SemanticPropertyKey.Category, "file"),
  ],
);