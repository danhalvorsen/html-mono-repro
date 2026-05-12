import { type CSSResultGroup, type TemplateResult } from "lit";
import {
  customElement,
  property,
  queryAssignedElements,
} from "lit/decorators.js";
import { GameObjectSubject } from "../../game-design-patterns/src/GameObjectSubject";
import {
  DefaultBaseGameObjectOptions,
  type BaseGameObjectOptions,
} from "./BaseGameObjectOptions.js";
import { BaseGameObjectShapeTemplate } from "./BaseGameObjectShapeTemplate.js";
import { BaseGameObjectSlots } from "./BaseGameObjectSlots.js";
import { BaseGameObjectStyles } from "./BaseGameObjectStyles.js";
import { BaseGameObjectTemplate } from "./BaseGameObjectTemplate.js";
import { EmptyBaseGameObjectShapeTemplate } from "./EmptyBaseGameObjectShapeTemplate.js";

@customElement("base-game-object")
export class BaseGameObject extends GameObjectSubject {
  public static styles: CSSResultGroup = [
    GameObjectSubject.styles ?? [],
    BaseGameObjectStyles.styles,
  ];

  readonly #template = new BaseGameObjectTemplate();

  @property({ attribute: false })
  public options: BaseGameObjectOptions = DefaultBaseGameObjectOptions;

  @property({ attribute: false })
  public shapeTemplate: BaseGameObjectShapeTemplate =
    new EmptyBaseGameObjectShapeTemplate();

  @queryAssignedElements({
    slot: BaseGameObjectSlots.Children,
    flatten: true,
  })
  private assignedChildren!: Element[];

  protected render(): TemplateResult {
    return this.#template.render(
      this.positionX,
      this.positionY,
      {
        ...this.options,
        rotationRadians: this.getCurrentRotationRadians(),
      },
      this.shapeTemplate.render(),
      this.#onChildrenSlotChanged,
    );
  }

  public getChildren(): readonly BaseGameObject[] {
    return this.assignedChildren.filter(
      (element): element is BaseGameObject =>
        element instanceof BaseGameObject,
    );
  }

  readonly #onChildrenSlotChanged = (): void => {
    const invalidChildren = this.assignedChildren.filter(
      (element) => !(element instanceof BaseGameObject),
    );

    if (invalidChildren.length === 0) {
      return;
    }

    throw new TypeError(
      "base-game-object children slot only accepts BaseGameObject elements.",
    );
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "base-game-object": BaseGameObject;
  }
}
BaseGameObject